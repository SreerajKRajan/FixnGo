import React, { useState, useEffect } from "react";
import { FaSearch, FaComments, FaVideo, FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/userAuthSlice";

const UserHomePage = () => {
  const [activeTab, setActiveTab] = useState("map");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle the logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Prevent browser back action
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
    <div className="min-h-screen bg-gray-100">
      {/* Header Section */}
      <header className="bg-blue-600 text-white p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">FixNgo</h1>
          <div className="flex items-center space-x-4">
            <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-400">
              <FaComments />
            </button>
            <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-400">
              <FaVideo />
            </button>
            <button className="p-2 rounded-full bg-blue-500 hover:bg-blue-400">
              <FaUser />
            </button>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white py-1 px-3 rounded-md hover:bg-red-600 transition duration-300"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Section */}
      <main className="container mx-auto mt-8 px-4">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-md p-4 mb-8">
          <div className="flex items-center">
            <input
              type="text"
              placeholder="Search for nearby workshops..."
              className="flex-grow p-2 border rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button className="bg-blue-500 text-white p-2 rounded-r-md hover:bg-blue-600">
              <FaSearch />
            </button>
          </div>
        </div>

        {/* Tabs for Map and Service Requests */}
        <div className="flex mb-4 space-x-4">
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === "map" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("map")}
          >
            Map
          </button>
          <button
            className={`px-4 py-2 rounded-md ${
              activeTab === "requests" ? "bg-blue-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setActiveTab("requests")}
          >
            Service Requests
          </button>
        </div>

        {/* Conditional Rendering for Tabs */}
        {activeTab === "map" && (
          <div className="bg-white rounded-lg shadow-md p-4 h-96">
            {/* Placeholder for map component */}
            <div className="w-full h-full bg-gray-300 flex items-center justify-center">
              Map Component (Google Maps or similar) goes here
            </div>
          </div>
        )}

        {activeTab === "requests" && (
          <div className="bg-white rounded-lg shadow-md p-4">
            <h2 className="text-xl font-semibold mb-4">Service Requests</h2>
            <div className="space-y-4">
              <div className="border-b pb-4">
                <h3 className="font-semibold">Active Request: Flat Tire</h3>
                <p className="text-sm text-gray-600">Workshop: Quick Fix Auto</p>
                <p className="text-sm text-gray-600">Status: En route</p>
              </div>
              <div className="border-b pb-4">
                <h3 className="font-semibold">Past Request: Oil Change</h3>
                <p className="text-sm text-gray-600">Workshop: Speedy Lube</p>
                <p className="text-sm text-gray-600">Status: Completed</p>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default UserHomePage;
