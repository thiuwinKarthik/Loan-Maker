import React from "react";
import { Navigate } from "react-router-dom";
import { session } from "../shared/auth/session";

const ProtectedRoute = ({ children, allowedRoles }) => {
  const token = session.getToken();
  const user = session.getUser();

  // If no token → redirect to login
  if (!token || !user) {
    return <Navigate to="/" replace />;
  }

  // If user's role is not allowed → redirect to login
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
};

export default ProtectedRoute;
