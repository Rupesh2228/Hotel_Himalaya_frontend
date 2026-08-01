/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { getApiUrl } from "../config/api";

const getAuthHeaders = () => { const token = localStorage.getItem('token'); return token ? { Authorization: 'Bearer ' + token } : {}; };


const AuthContext = createContext();

const apiUrl = () => getApiUrl();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // ── Token helpers ────────────────────────────────────────────────────────────

  const saveToken = (t) => {
    localStorage.setItem("token", t);
    setToken(t);
  };

  const clearToken = () => {
    localStorage.removeItem("token");
    setToken(null);
  };

  // ── Logout ───────────────────────────────────────────────────────────────────
  const logout = useCallback(async () => {
    try {
      if (token) {
        await fetch(`${apiUrl()}/api/auth/logout`, {
          method: "POST",
          headers: getAuthHeaders()
        });
      }
    } catch {
      // best-effort
    } finally {
      clearToken();
      setUser(null);
      setError(null);
    }
  }, [token]);

  // ── Refresh current user from server ────────────────────────────────────────
  const refreshUser = useCallback(async () => {
    if (!token) return null;
    try {
      const res = await fetch(`${apiUrl()}/api/auth/me`, {
        headers: getAuthHeaders()
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data);
        return data;
      }
      logout();
      return null;
    } catch (err) {
      console.error("Failed to refresh user:", err);
      return null;
    }
  }, [token, logout]);

  // Load user on mount / token change
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) { setLoading(false); return; }
      await refreshUser();
      setLoading(false);
    };
    fetchUser();
  }, [token, refreshUser]);

  // Sync across tabs
  useEffect(() => {
    const handleStorage = (e) => {
      if (e.key !== "roleUpdate" || !e.newValue) return;
      try {
        const payload = JSON.parse(e.newValue);
        const id = user?.id || user?._id;
        if (id && payload.userId === id) refreshUser();
      } catch { /* ignore */ }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [user, refreshUser]);

  // ── Helper: parse JSON and extract error message ─────────────────────────────
  const extractError = (err) => {
    if (err?.message?.includes("Failed to fetch")) {
      return `Unable to reach server at ${apiUrl()}. Is the backend running?`;
    }
    return err?.message || "Something went wrong";
  };

  // ── 1. Signup ────────────────────────────────────────────────────────────────
  const signup = async (name, email, phone, password, confirmPassword) => {
    setError(null);
    const res = await fetch(`${apiUrl()}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Registration failed");
    return data; // { message, email }
  };

  // ── 2. Verify OTP ────────────────────────────────────────────────────────────
  const verifyOTP = async (email, otp) => {
    setError(null);
    const res = await fetch(`${apiUrl()}/api/auth/verify-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verification failed");
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── 3. Resend OTP ────────────────────────────────────────────────────────────
  const resendOTP = async (email) => {
    setError(null);
    const res = await fetch(`${apiUrl()}/api/auth/resend-otp`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to resend OTP");
    return data; // { message, attemptsRemaining }
  };

  // ── 4. Login ─────────────────────────────────────────────────────────────────
  const login = async (email, password) => {
    setError(null);
    const res = await fetch(`${apiUrl()}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();
    // Unverified — return special object so UI can redirect to verify-otp
    if (res.status === 403 && data.status === "unverified") {
      return { unverified: true, email: data.email };
    }
    if (!res.ok) throw new Error(data.error || "Login failed");
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── 5. Google Login ──────────────────────────────────────────────────────────
  const googleLogin = async (credential, isAdminLogin = false) => {
    setError(null);
    const res = await fetch(`${apiUrl()}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ credential, isAdminLogin }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Google login failed");
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // ── 6. Forgot Password ───────────────────────────────────────────────────────
  const forgotPassword = async (email) => {
    setError(null);
    const res = await fetch(`${apiUrl()}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Request failed");
    return data; // { message }
  };

  // ── 7. Reset Password ────────────────────────────────────────────────────────
  const resetPassword = async (token, password, confirmPassword) => {
    setError(null);
    const res = await fetch(`${apiUrl()}/api/auth/reset-password/${token}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password, confirmPassword }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Password reset failed");
    saveToken(data.token);
    setUser(data.user);
    return data.user;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        signup,
        verifyOTP,
        resendOTP,
        login,
        googleLogin,
        forgotPassword,
        resetPassword,
        refreshUser,
        logout,
        setError,
        extractError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

