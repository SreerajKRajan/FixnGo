import React, { useState, useEffect } from "react"
import Header from "./Header"
import Tabs from "./Tabs"
import SearchBar from "./SearchBar"
import MapComponent from "./MapComponent"
import UserWorkshops from "./UserWorkshops"
import Footer from "./Footer"
import axiosInstance from "../../utils/axiosInstance"

// Shimmer Effect Component
const ShimmerEffect = ({ className }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`}></div>
);

export default function UserHomePage() {
  const [activeTab, setActiveTab] = useState(() => {
    return localStorage.getItem("activeTab") || "map"
  })
  const [userLocation, setUserLocation] = useState(null)
  const [workshops, setWorkshops] = useState([])
  const [loading, setLoading] = useState(false)

  const handleLocationSelect = (location) => {
    setUserLocation(location)
    fetchNearbyWorkshops(location)
  }

  const fetchNearbyWorkshops = async (location) => {
    setLoading(true)
    try {
      const response = await axiosInstance.get(
        `/users/workshops/nearby?latitude=${location.lat}&longitude=${location.lng}`,
      )
      setWorkshops(response.data)
    } catch (error) {
      console.error("Error fetching nearby workshops:", error)
      alert("Unable to fetch workshops. Please try again later.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    localStorage.setItem("activeTab", activeTab)
  }, [activeTab])

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto mt-8 px-4 mb-12">
        <h1 className="text-4xl font-bold text-gray-800 mb-8 text-center">Welcome to FixnGo</h1>
        <Tabs activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="mt-8">
          {activeTab === "map" && (
            <div className="flex flex-col lg:flex-row justify-between gap-8">
              <div className="lg:w-1/3">
                <SearchBar onLocationSelect={handleLocationSelect} />
              </div>
              <div className="lg:w-2/3">
                <div className="relative h-[calc(100vh-250px)] w-full rounded-lg overflow-hidden shadow-lg">
                  {loading && (
                    <div className="absolute inset-0 z-10 flex justify-center items-center bg-white bg-opacity-70">
                      {/* Shimmer effect for map loading */}
                      <div className="w-full h-full">
                        {/* Map location pins shimmer */}
                        <ShimmerEffect className="absolute top-1/4 left-1/4 h-4 w-4 rounded-full" />
                        <ShimmerEffect className="absolute top-1/2 left-1/3 h-4 w-4 rounded-full" />
                        <ShimmerEffect className="absolute top-1/3 left-1/2 h-4 w-4 rounded-full" />
                        <ShimmerEffect className="absolute bottom-1/4 right-1/4 h-4 w-4 rounded-full" />
                        
                        {/* Map UI elements shimmer */}
                        <ShimmerEffect className="absolute top-4 right-4 h-8 w-8 rounded" />
                        <ShimmerEffect className="absolute top-16 right-4 h-8 w-8 rounded" />
                        
                        {/* Map overlay shimmer */}
                        <div className="absolute inset-0 bg-gray-100 opacity-20"></div>
                      </div>
                    </div>
                  )}
                  <MapComponent userLocation={userLocation} workshops={workshops} />
                </div>
              </div>
            </div>
          )}

          {activeTab === "workshops" && (
            <div className="mt-8">
              <UserWorkshops workshops={workshops} />
            </div>
          )}
    
        </div>
      </main>
      <Footer />
    </div>
  )
}