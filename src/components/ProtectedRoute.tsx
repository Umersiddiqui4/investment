// src/components/ProtectedRoute.tsx
import { Navigate } from "react-router-dom";
import { ReactElement } from "react";

interface ProtectedRouteProps {
  isAuthenticated: boolean;
  children: ReactElement;
}

const ProtectedRoute = ({ isAuthenticated, children }: ProtectedRouteProps) => {
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default ProtectedRoute;
