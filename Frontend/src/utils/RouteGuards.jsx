import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const PublicRoute = ({ children }) => {
  // Get token from Redux or localStorage
  const token = useSelector((state) => state.auth.user?.token) || localStorage.getItem("token");
  
  return token ? <Navigate to="/home" replace /> : children;
};

export const ProtectedRoute = ({ children, role }) => {
  // Get token from Redux or localStorage
  const userToken = useSelector((state) => state.auth.user?.token) || localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  // Decide token based on role
  const token = role === "admin" ? adminToken : userToken;

  return token ? children : <Navigate to={role === "admin" ? "/admin/login" : "/login"} replace />;
};
