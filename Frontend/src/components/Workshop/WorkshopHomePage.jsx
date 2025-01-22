import React, { useEffect, useState } from "react";
import WorkshopHeader from "@/components/Workshop/WorkshopHeader";
import WorkshopFooter from "@/components/Workshop/WorkshopFooter";
import { logout } from "../../store/workshopAuthSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import UserRequestsPage from "@/components/Workshop/ServiceManagement/UserRequestsPage";

const WorkshopHomePage = () => {
  const [activeTab, setActiveTab] = useState("requests");
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
        <div className="flex mb-4 space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === "requests"
                ? "bg-black text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Service Requests
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === "map"
                ? "bg-black text-white"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
            onClick={() => setActiveTab("map")}
          >
            Live Map
          </button>
        </div>

        {activeTab === "requests" && <UserRequestsPage />}
        {activeTab === "map" && (
          <div className="bg-white text-black rounded-lg shadow-md p-4 h-96">
            {/* Placeholder for map component */}
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              Live Map Component (Google Maps or similar) goes here
            </div>
          </div>
        )}
      </main>

      <WorkshopFooter />
    </div>
  );
};

export default WorkshopHomePage;
