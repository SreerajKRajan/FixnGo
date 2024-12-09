import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

export const PublicRoute = ({ children }) => {
  const userToken = useSelector((state) => state.userAuth.user?.token) || localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  // If either token exists, redirect to their respective dashboard
  if (userToken) return <Navigate to="/home" replace />;
  if (adminToken) return <Navigate to="/admin/dashboard" replace />;
  
  return children; // No token, proceed to public route
};


export const ProtectedRoute = ({ children, role }) => {
  const userToken = useSelector((state) => state.userAuth.user?.token) || localStorage.getItem("token");
  const adminToken = localStorage.getItem("adminToken");

  if (role === "admin") {
    return adminToken ? children : <Navigate to="/admin/login" replace />;
  }

  return userToken ? children : <Navigate to="/login" replace />;
};
