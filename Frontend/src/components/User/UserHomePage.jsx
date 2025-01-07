import React, { useState, useEffect } from "react";
import Header from "./Header";
import SearchBar from "./SearchBar";
import Tabs from "./Tabs";
import MapComponent from "./MapComponent";
import ServiceRequests from "./ServiceRequests";
import Footer from "./Footer";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function UserHomePage() {
  const [activeTab, setActiveTab] = useState("map");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [userLocation, setUserLocation] = useState(null); // Store user location
  const [workshops, setWorkshops] = useState([]); // Store nearby workshops
  const navigate = useNavigate();

  const handleLocationSelect = (location) => {
    setUserLocation(location);
    fetchNearbyWorkshops(location);
  };

  const fetchNearbyWorkshops = async (location) => {
    try {
      const response = await axios.get(
        `/api/users/workshops/nearby?lat=${location.lat}&lng=${location.lng}`
      );
      setWorkshops(response.data); // Store workshops data
    } catch (error) {
      console.error("Error fetching nearby workshops:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-black">
      {isLoggedIn && <Header onLogout={() => navigate("/login")} />}
      <main className="flex-grow container mx-auto mt-8 px-4">
        <SearchBar onLocationSelect={handleLocationSelect} />
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        {activeTab === "map" && (
          <div className="h-[calc(100vh-200px)] w-full">
            <MapComponent userLocation={userLocation} workshops={workshops} />
          </div>
        )}
        {activeTab === "requests" && <ServiceRequests />}
      </main>
      <Footer />
    </div>
  );
}
