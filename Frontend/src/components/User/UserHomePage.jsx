import React, { useState, useEffect } from "react";
import { Spacer } from "@nextui-org/react";
import Header from "./Header";
import Tabs from "./Tabs";
import SearchBar from "./SearchBar";
import MapComponent from "./MapComponent";
import UserWorkshops from "./UserWorkshops";
import Footer from "./Footer";
import { useNavigate } from "react-router-dom";
import axiosInstance from "../../utils/axiosInstance";

export default function UserHomePage() {
  const [activeTab, setActiveTab] = useState(() => {
    // Get the saved tab from localStorage or default to "map"
    return localStorage.getItem("activeTab") || "map";
  });
  const [userLocation, setUserLocation] = useState(null);
  const [workshops, setWorkshops] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLocationSelect = (location) => {
    setUserLocation(location);
    fetchNearbyWorkshops(location);
  };

  const fetchNearbyWorkshops = async (location) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(
        `/users/workshops/nearby?latitude=${location.lat}&longitude=${location.lng}`
      );
      setWorkshops(response.data);
    } catch (error) {
      console.error("Error fetching nearby workshops:", error);
      alert("Unable to fetch workshops. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Save the active tab to localStorage whenever it changes
    localStorage.setItem("activeTab", activeTab);
  }, [activeTab]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto mt-8 px-4">
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <Spacer y={2} />

        {activeTab === "map" && (
          <div className="flex justify-between">
            {/* Left Side (Search Bar or other content) */}
            <div className="flex-1 pr-4">
              {/* Added padding to the right to give space between search bar and map */}
              <SearchBar onLocationSelect={handleLocationSelect} />
              <Spacer y={2} />
            </div>

            {/* Right Side (Map Component) */}
            <div className="flex-1 md:w-1/2 w-full">
              {/* Increased width of the map container */}
              <div className="relative h-[calc(100vh-250px)] w-full rounded-lg overflow-hidden shadow-lg">
                {/* Increased height */}
                {loading && (
                  <div className="absolute inset-0 z-10 flex justify-center items-center bg-white bg-opacity-70">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
                  </div>
                )}
                <MapComponent userLocation={userLocation} workshops={workshops} />
              </div>
            </div>
          </div>
        )}

        {activeTab === "workshops" && (
          <div>
            <UserWorkshops workshops={workshops} />
          </div>
        )}
      </main>
      <div className="mt-4">
        <Footer />
      </div>
    </div>
  );
}
