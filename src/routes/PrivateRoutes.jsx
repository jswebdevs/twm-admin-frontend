import React from "react";
import { Navigate, Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";

const PrivateRoutes = () => {
  const { user, loading } = useAuth();

  // Optional: Show a spinner while checking auth status
  if (loading) {
    return <div className="p-10">Loading...</div>;
  }

  // If not logged in, redirect to Login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If logged in, render the child route (which is <Root />)
  return <Outlet />;
};

export default PrivateRoutes;
