import React from "react";
import { Navigate } from "react-router";
import { useAuth } from "../authContext";

const USER_TYPES = ["STUDENT", "COORDINATOR", "DEVELOPER"];

const normalizeUserType = (type) => {
  if (!type) return "";
  return USER_TYPES.find(t => t.toLowerCase() === type.toLowerCase()) || type.toUpperCase();
};

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const userType = normalizeUserType(user.user_type);

  if (
    allowedRoles &&
    !allowedRoles.map(r => normalizeUserType(r)).includes(userType)
  ) {
    // Redirect to profile if user type is not allowed
    return <Navigate to="/profile" replace />;
  }

  return children;
};

export default ProtectedRoute;
