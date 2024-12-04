import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const PublicRoute = ({ children }) => {
  // Get token from Redux or localStorage
  const token = useSelector((state) => state.auth.user?.token) || localStorage.getItem("token");
  
  return token ? <Navigate to="/home" replace /> : children;
};

export const ProtectedRoute = ({ children }) => {
  // Get token from Redux or localStorage
  const token = useSelector((state) => state.auth.user?.token) || localStorage.getItem("token");
  
  return token ? children : <Navigate to="/login" replace />;
};
