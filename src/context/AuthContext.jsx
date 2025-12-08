
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";

const AuthContext = createContext();

const TOKEN_KEY = "hotel_auth_token";
const USER_KEY = "hotel_auth_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    if (token && userJson) {
      try {
        const parsed = JSON.parse(userJson);
        setUser(parsed);
      } catch {
        localStorage.removeItem(TOKEN_KEY);
        localStorage.removeItem(USER_KEY);
      }
    }
  }, []);

  const login = (userData) => {
    const token = "FAKE_JWT_TOKEN";
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(userData));
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  };

  const isAdmin = useMemo(() => {
    return user?.role === "admin";
  }, [user]);

  const isPublicUser = useMemo(() => {
    return user?.role === "user";
  }, [user]);

  const value = useMemo(
    () => ({
      user,
      isAuthenticated: !!user,
      isAdmin,
      isPublicUser,
      login,
      logout
    }),
    [user, isAdmin, isPublicUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
