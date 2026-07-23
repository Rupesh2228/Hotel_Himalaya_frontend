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
