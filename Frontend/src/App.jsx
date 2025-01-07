import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import LandingPage from "./components/LandingPage";
import UserHomePage from "./components/User/UserHomePage";
import { PublicRoute, ProtectedRoute } from "./utils/RouteGuards";
import AdminLogin from "./components/Admin/AdminLogin";
import { AdminDashboard } from "./components/Admin/AdminDachboard";
import UserLogin from "./components/Auth/UserLogin";
import UserSignup from "./components/Auth/UserSignup";
import UserOtpVerification from "./components/Auth/UserOtpVerification";
import WorkshopSignup from "./components/Auth/WorkshopSignup";
import WorkshopOtpVerification from "./components/Auth/workshopOtpVerification";
import WorkshopLogin from "./components/Auth/WorkshopLogin";
import WorkshopHomePage from "./components/Workshop/WorkshopHomePage";
import NotFound from "./components/NotFound";
import UserProfile from "./components/User/UserProfile";
import WorkshopServiceList from "./components/Workshop/WorkshopServiceList";
import WorkshopServiceManagement from "./components/Workshop/ServiceManagement/WorkshopServiceManagement";

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
                <UserHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/user-profile"
            element={
              <ProtectedRoute>
                <UserProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/login"
            element={
              <PublicRoute>
                <AdminLogin />
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
          <Route
            path="/workshop/home"
            element={
              <ProtectedRoute role="workshop">
                <WorkshopHomePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workshop/services"
            element={
              <ProtectedRoute role="workshop">
                <WorkshopServiceManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/workshop/service-list"
            element={
              <ProtectedRoute role="workshop">
                <WorkshopServiceList />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
