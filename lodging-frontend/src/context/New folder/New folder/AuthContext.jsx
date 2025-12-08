import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import axiosClient from "../lib/axiosClient.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Restore from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("auth_user");
    if (storedToken && storedUser) {
      setToken(storedToken);
      try {
        setUser(JSON.parse(storedUser));
      } catch {
        setUser(null);
      }
    }
    setIsLoading(false);
  }, []);

  const login = async (username, password) => {
    // You can replace this with real API: POST /api/auth/login
    // For now, call a hypothetical endpoint and expect { token, user }
    // const response = await axiosClient.post("/api/auth/login", {
    //   username,
    //   password
    // });

    // const { token: jwtToken, user: userInfo } = response.data;

     const jwtToken = "Amit";
     const userInfo = "Details";
    // localStorage.setItem("auth_token", jwtToken);
    // localStorage.setItem("auth_user", JSON.stringify(userInfo));

     
    localStorage.setItem("auth_token", jwtToken);
    localStorage.setItem("auth_user", userInfo);

    setToken(jwtToken);
    setUser(userInfo);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("auth_user");
    setToken(null);
    setUser(null);
  };

  const value = useMemo(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!user && !!token,
      login,
      logout
    }),
    [user, token, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
