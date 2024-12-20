import React, { useState, useEffect } from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Tabs from "./Tabs";
import MapPlaceholder from "./MapPlaceholder";
import ServiceRequests from "./ServiceRequests";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";

export default function UserHomePage() {
  const [activeTab, setActiveTab] = useState("map");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const navigate = useNavigate()

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

  const handleLogout = () => {
    // Perform any necessary logout logic here (e.g., clear localStorage)
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    setIsLoggedIn(false); // Set the logged-in state to false
    navigate("/login")
    // Additional actions if needed
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-black">  {/* Set background to white and text to black */}      
      {/* Main Content */}
      {isLoggedIn && <Header onLogout={handleLogout} />}
      <main className="flex-grow container mx-auto mt-8 px-4">
        <SearchBar />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "map" && <MapPlaceholder />}
        {activeTab === "requests" && <ServiceRequests />}
      </main>
      
      {/* Footer */}
      <Footer /> {/* Include Footer at the bottom */}
    </div>
  );
}
