import { Navigate, Outlet } from "react-router-dom";

export default function ProtectedRoute() {
  const token = localStorage.getItem("token1");

  if (!token || token === "undefined" || token === "null") {
    return <Navigate to="/auth/login" replace />;
  }

  return <Outlet />;
}