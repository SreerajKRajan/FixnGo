import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import Home from "./components/User/Home";
import { PublicRoute, ProtectedRoute } from "./utils/RouteGuards";
import AdminLogin from "./components/Admin/AdminLogin";
import { AdminDashboard } from "./components/Admin/AdminDachboard";
import UserLogin from "./components/Auth/UserLogin";
import UserSignup from "./components/Auth/UserSignup";
import UserOtpVerification from "./components/Auth/UserOtpVerification";
import WorkshopSignup from "./components/Auth/WorkshopSignup";
import WorkshopOtpVerification from "./components/Auth/workshopOtpVerification";
import WorkshopLogin from "./components/Auth/WorkshopLogin";

function App() {
  return (
    <Router>
      <div>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route
            path="/login"
            element={
              <PublicRoute>
                <UserLogin />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <UserSignup />
              </PublicRoute>
            }
          />
          <Route
            path="/otp_verification"
            element={
              <PublicRoute>
                <UserOtpVerification />
              </PublicRoute>
            }
          />
          <Route
            path="/home"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <AdminLogin />{" "}
              </PublicRoute>
            }
          />
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workshop/signup"
            element={
              <PublicRoute>
                <WorkshopSignup />
              </PublicRoute>
            }
          />
          <Route
            path="/workshop/otp_verification"
            element={
              <PublicRoute>
                <WorkshopOtpVerification />
              </PublicRoute>
            }
          />
          <Route
            path="/workshop/login"
            element={
              <PublicRoute>
                <WorkshopLogin />
              </PublicRoute>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
