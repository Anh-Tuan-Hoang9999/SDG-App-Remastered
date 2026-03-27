import React, { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import client from "./api/client";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem("token"));
  const [loading, setLoading] = useState(true);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Token expiry check
  // merged into one effect to avoid a race condition
  useEffect(() => {
  async function fetchUser() {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }

    try {
      const decoded = jwtDecode(token);
      if (decoded.exp && Date.now() >= decoded.exp * 1000) {
        setSessionExpired(true);
        setToken(null);
        setUser(null);
        localStorage.removeItem("token");
        setLoading(false);
        return;
      }
    } catch {
      // Invalid token, treat as expired
      setSessionExpired(true);
      setToken(null);
      setUser(null);
      localStorage.removeItem("token");
      setLoading(false);
      return;
    }

    // token now is verified as valid, fetch user data
    try {
      const res = await client.get("/users/me");
      setUser(res.data);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem("token");
      setSessionExpired(true);
    }
    setLoading(false);
  }

  fetchUser();
}, [token]);

  const login = (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);
    setSessionExpired(false);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem("token");
    setSessionExpired(false);
  };

  const updateUser = (updatedUser) => {
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading, sessionExpired, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
