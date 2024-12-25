import React, { useState, useEffect } from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Tabs from "./Tabs";
import MapComponent from "./MapComponent";  // The map component that will be displayed
import ServiceRequests from "./ServiceRequests";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

export default function UserHomePage() {
  const [activeTab, setActiveTab] = useState("map");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate();

  // Ensure that back navigation is handled properly
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

  // Handle logout and clean up session data
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false); // Set the logged-in state to false
    navigate("/login");
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">
      {/* Main Content */}
      {isLoggedIn && <Header onLogout={handleLogout} />}
      <main className="flex-grow container mx-auto mt-8 px-4">
        <SearchBar />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Tab content */}
        {activeTab === "map" && (
          <div className="h-[500px] sm:h-[700px] w-full">
            {/* The map container now takes full height and width */}
            <MapComponent />
          </div>
        )}
        {activeTab === "requests" && <ServiceRequests />}
      </main>
      
      {/* Footer */}
      <Footer />
    </div>
  );
}
