import React, { useEffect, useState } from "react";
import WorkshopHeader from "@/components/Workshop/WorkshopHeader";
import WorkshopFooter from "@/components/Workshop/WorkshopFooter";
import { logout } from "../../store/workshopAuthSlice";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

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

        {activeTab === "requests" && (
          <div className="bg-white text-black rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Service Requests</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold">
                  New Request: Engine Won't Start
                </h3>
                <p className="text-sm text-gray-600">User: John Doe</p>
                <p className="text-sm text-gray-600">Location: 123 Main St</p>
                <div className="mt-2">
                  <button className="bg-green-500 text-white px-4 py-2 rounded-md mr-2 hover:bg-green-600">
                    Accept
                  </button>
                  <button className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600">
                    Reject
                  </button>
                </div>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold">Active Request: Flat Tire</h3>
                <p className="text-sm text-gray-600">User: Jane Smith</p>
                <p className="text-sm text-gray-600">Status: En route</p>
                <div className="mt-2">
                  <button className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-700">
                    Update Status
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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
