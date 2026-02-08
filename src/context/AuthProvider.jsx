import React, { createContext, useState, useEffect } from "react";
import { ENDPOINTS } from "../config"; // Ensure you have AUTH endpoints defined

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on page load
    const storedUser = localStorage.getItem("userInfo");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await fetch(
      `${import.meta.env.VITE_API_BASE_URL}/api/auth/login`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      },
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Save to state and local storage
    localStorage.setItem("userInfo", JSON.stringify(data));
    // Also simpler: save token separately if you prefer
    localStorage.setItem("adminToken", data.token);
    setUser(data);
  };

  const logout = () => {
    localStorage.removeItem("userInfo");
    localStorage.removeItem("adminToken");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
