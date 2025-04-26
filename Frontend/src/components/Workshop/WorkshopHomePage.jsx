import React, { useEffect } from "react";
import WorkshopHeader from "@/components/Workshop/WorkshopHeader";
import WorkshopFooter from "@/components/Workshop/WorkshopFooter";
import { logout } from "../../store/workshopAuthSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserRequestsPage from "@/components/Workshop/ServiceManagement/UserRequestsPage";

const WorkshopHomePage = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const handleLogout = () => {
    dispatch(logout());
    navigate("/workshop/login");
  };

  useEffect(() => {
    window.history.pushState(null, "", window.location.href);
    const handlePopState = () => {
      window.history.pushState(null, "", window.location.href);
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return (
    <div className="min-h-screen bg-white text-black">
      <WorkshopHeader onLogout={handleLogout} />

      <main className="container mx-auto mt-8 px-4">
        <UserRequestsPage />
      </main>

      <WorkshopFooter />
    </div>
  );
};

export default WorkshopHomePage;