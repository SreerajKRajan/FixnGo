"use client"

import { useDispatch } from "react-redux";
import { logout } from "../../store/workshopAuthSlice";
import { useNavigate } from "react-router-dom";
import Header from "./WorkshopHeader";
import Footer from "./WorkshopFooter";
import { useEffect, useState } from "react";
import axiosInstance from "../../utils/axiosInstance";
import EditWorkshopModal from "./EditWorkshopModal";
import defaultProfileImage from "../../assets/no-profile.png"

// Shimmer Loading Component
const ShimmerEffect = () => {
  return (
    <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden animate-pulse">
      {/* Profile Header Shimmer */}
      <div className="bg-gray-300 p-6">
        <div className="flex flex-col items-center">
          <div className="w-32 h-32 bg-gray-200 rounded-full overflow-hidden border-4 border-white"></div>
          <div className="h-6 bg-gray-200 rounded w-40 mt-4"></div>
          <div className="h-4 bg-gray-200 rounded w-32 mt-2"></div>
        </div>
      </div>

      {/* Profile Details Shimmer */}
      <div className="p-6">
        <div className="h-5 bg-gray-200 rounded w-40 mb-4"></div>
        <div className="space-y-4">
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
        </div>
      </div>

      {/* Footer Actions Shimmer */}
      <div className="p-6 border-t flex justify-end gap-4">
        <div className="h-10 bg-gray-200 rounded w-28"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  );
};

export default function WorkshopProfile() {
  const [workshopData, setWorkshopData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/workshop/login");
  };

  // Open Document in New Tab
  const openDocument = (documentUrl) => {
    if (documentUrl) {
      window.open(documentUrl, '_blank');
    }
  };

  // Fetch Workshop Profile
  const fetchWorkshopProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("workshop_token");
      const response = await axiosInstance.get("/workshop/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setWorkshopData(response.data);
    } catch (error) {
      console.error("Failed to fetch workshop profile", error);
      if (error.response?.status === 403) {
        setError({
          message: error.response.data.error || "Access denied",
          status: error.response.data.status || "rejected",
          reason: error.response.data.rejection_reason || "No reason provided"
        });
      } else {
        setError({
          message: "Failed to fetch workshop profile. Please try again later."
        });
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch Profile on Component Mount
  useEffect(() => {
    fetchWorkshopProfile();
  }, []);

  // Show Shimmer Loading Effect
  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex justify-center items-center p-6">
          <ShimmerEffect />
        </div>
        <Footer />
      </div>
    );
  }

  // Show Error Message
  if (error) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex justify-center items-center p-6">
          <div className="w-full max-w-2xl bg-white rounded-lg shadow-lg overflow-hidden">
            <div className="bg-red-600 p-6 text-white">
              <h1 className="text-xl font-bold">Access Denied</h1>
            </div>
            <div className="p-6">
              <p className="text-lg font-semibold mb-4">{error.message}</p>
              {error.status === "rejected" && (
                <div className="mt-4 bg-gray-100 p-4 rounded-lg">
                  <p className="font-semibold">Reason for rejection:</p>
                  <p className="mt-2">{error.reason}</p>
                </div>
              )}
              <div className="mt-6">
                <button
                  onClick={handleLogout}
                  className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex justify-center p-6">
        <div className="w-full max-w-2xl">
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {/* Profile Header */}
            <div className="bg-black p-6 text-white">
              <div className="flex flex-col items-center">
                <div className="w-32 h-32 bg-white rounded-full overflow-hidden border-4 border-white shadow-md">
                  <img
                    src={workshopData.profile_image || defaultProfileImage}
                    alt="Workshop Profile"
                    className="w-full h-full object-cover"
                  />
                </div>
                <h1 className="text-2xl font-bold mt-4">{workshopData.name}</h1>
                <p className="text-sm">{workshopData.email}</p>
                <div className="mt-2 inline-flex items-center bg-green-500 text-white px-3 py-1 rounded-full text-xs">
                  {workshopData.approval_status === "approved" ? "Approved" : workshopData.approval_status}
                </div>
              </div>
            </div>

            {/* Profile Details */}
            <div className="p-6">
              <h2 className="text-lg font-semibold text-black mb-4">Workshop Details</h2>
              <div className="space-y-4 text-black">
                <p>
                  <span className="font-semibold">Email:</span> {workshopData.email}
                </p>
                <p>
                  <span className="font-semibold">Phone:</span> +91 {workshopData.phone}
                </p>
                <p>
                  <span className="font-semibold">Location:</span> {workshopData.location}
                </p>
                <div className="mt-4">
                  <span className="font-semibold">Documents:</span>
                  <div className="mt-2 flex">
                    <div 
                      onClick={() => openDocument(workshopData.document)}
                      className="cursor-pointer flex items-center border border-gray-300 rounded-lg p-2 hover:bg-gray-100"
                    >
                      <span>View Document</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="p-6 border-t flex justify-end gap-4">
              <button
                onClick={() => setIsModalOpen(true)}
                className="bg-black hover:bg-gray-800 text-white px-4 py-2 rounded-lg"
              >
                Edit Profile
              </button>
              <button
                onClick={handleLogout}
                className="bg-gray-300 hover:bg-gray-200 text-black px-4 py-2 rounded-lg"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />

      {isModalOpen && (
        <EditWorkshopModal
          workshopData={workshopData}
          onClose={() => setIsModalOpen(false)}
          onProfileUpdate={fetchWorkshopProfile} // Refetch profile data after update
        />
      )}
    </div>
  );
}