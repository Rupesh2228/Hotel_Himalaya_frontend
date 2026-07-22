/* eslint-disable react-refresh/only-export-components */
import { createContext, useState, useEffect, useContext, useCallback } from "react";
import { getApiUrl } from '../config/api';

const AuthContext = createContext();

// Always call getApiUrl() at request time so it picks up window.location correctly.
const apiUrl = () => getApiUrl();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Logout
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return null;

    try {
      const res = await fetch(`${apiUrl()}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
        return userData;
      }

      logout();
      return null;
    } catch (err) {
      console.error("Failed to load user profile:", err);
      return null;
    }
  }, [token, logout]);

  // Load user details if token exists
  useEffect(() => {
    const fetchUser = async () => {
      if (!token) {
        setLoading(false);
        return;
      }

      await refreshUser();
      setLoading(false);
    };

    fetchUser();
  }, [token, refreshUser]);

  useEffect(() => {
    if (!token) return undefined;

    const handleFocus = () => {
      refreshUser();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [token, refreshUser]);

  useEffect(() => {
    const handleStorage = (event) => {
      if (event.key !== 'roleUpdate' || !event.newValue) return;
      try {
        const payload = JSON.parse(event.newValue);
        const currentUserId = user?.id || user?._id;
        if (!currentUserId || payload.userId !== currentUserId) return;
        refreshUser();
      } catch {
        // ignore malformed payload
      }
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [user, refreshUser]);

  // Login with email and password
  const login = async (email, password) => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      localStorage.setItem("token", data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = (err && err.message && err.message.includes('Failed to fetch'))
        ? `Unable to reach server at ${apiUrl()}. Is the backend running?`
        : (err.message || 'Login failed');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  };

  // Signup with name, email, password
  const signup = async (name, email, password) => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Signup failed");
      }

      // The backend now sends a verification OTP to the user's email.
      // Return the server message so UI can prompt for the OTP.
      return data;
    } catch (err) {
      const msg = (err && err.message && err.message.includes('Failed to fetch'))
        ? `Unable to reach server at ${apiUrl()}. Is the backend running?`
        : (err.message || 'Signup failed');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  };

  // Verify signup OTP and finish registration
  const verifySignupOTP = async (email, otp) => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/verify-signup-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = (err && err.message && err.message.includes('Failed to fetch'))
        ? `Unable to reach server at ${apiUrl()}. Is the backend running?`
        : (err.message || 'Verification failed');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  };

  // Request password reset OTP
  const requestPasswordReset = async (email) => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/request-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      return data;
    } catch (err) {
      const msg = (err && err.message && err.message.includes('Failed to fetch'))
        ? `Unable to reach server at ${apiUrl()}. Is the backend running?`
        : (err.message || 'Request failed');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  };

  // Verify reset OTP and set new password
  const verifyPasswordReset = async (email, otp, newPassword) => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/verify-reset`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      return data;
    } catch (err) {
      const msg = (err && err.message && err.message.includes('Failed to fetch'))
        ? `Unable to reach server at ${apiUrl()}. Is the backend running?`
        : (err.message || 'Reset failed');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  };

  // Google login (OAuth ID token)
  const googleLogin = async (credential) => {
    setError(null);
    try {
      const res = await fetch(`${apiUrl()}/api/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Google login failed');
      }

      localStorage.setItem('token', data.token);
      setToken(data.token);
      setUser(data.user);
      return data.user;
    } catch (err) {
      const msg = (err && err.message && err.message.includes('Failed to fetch'))
        ? `Unable to reach server at ${apiUrl()}. Is the backend running?`
        : (err.message || 'Google login failed');
      setError(msg);
      throw new Error(msg, { cause: err });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        error,
        login,
        signup,
        verifySignupOTP,
        requestPasswordReset,
        verifyPasswordReset,
        googleLogin,
        refreshUser,
        logout,
        setError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
