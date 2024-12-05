import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Login from "./components/Auth/Login";
import Signup from "./components/Auth/Signup";
import LandingPage from "./components/LandingPage";
import Home from "./components/User/Home";
import OtpVerification from "./components/Auth/OtpVerification";
import { PublicRoute, ProtectedRoute } from "./utils/RouteGuards";
import AdminLogin from "./components/Admin/AdminLogin";

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
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/signup"
            element={
              <PublicRoute>
                <Signup />
              </PublicRoute>
            }
          />
          <Route
            path="/otp_verification"
            element={
              <PublicRoute>
                <OtpVerification />
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
                <AdminLogin />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
