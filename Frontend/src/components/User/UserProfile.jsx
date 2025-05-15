"use client"

import { useDispatch } from "react-redux"
import { logout } from "../../store/userAuthSlice"
import { useNavigate } from "react-router-dom"
import Header from "./Header"
import Footer from "./Footer"
import { useEffect, useState } from "react"
import axiosInstance from "../../utils/axiosInstance"
import EditProfileModal from "./EditUserProfileModal"
import UserRequestHistory from "../User/UserRequestHistory"
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
        </div>
      </div>

      {/* Footer Actions Shimmer */}
      <div className="p-6 border-t flex justify-end gap-4">
        <div className="h-10 bg-gray-200 rounded w-28"></div>
        <div className="h-10 bg-gray-200 rounded w-24"></div>
      </div>
    </div>
  )
}

export default function UserProfile() {
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()
  const navigate = useNavigate()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [activeSection, setActiveSection] = useState("profile") // 'profile' or 'history'

  // Handle Logout
  const handleLogout = () => {
    dispatch(logout())
    navigate("/login")
  }

  // Fetch User Profile
  const fetchUserProfile = async () => {
    setLoading(true)
    try {
      const token = localStorage.getItem("token")
      const response = await axiosInstance.get("/users/profile/", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      setUserData(response.data)
    } catch (error) {
      console.error("Failed to fetch user profile", error)
    } finally {
      setLoading(false)
    }
  }

  // Fetch Profile on Component Mount
  useEffect(() => {
    fetchUserProfile()
  }, [])

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
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Header />
      <div className="flex-1 flex justify-center p-6">
        <div className="w-full max-w-4xl">
          {/* Navigation Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveSection("profile")}
                className={`${
                  activeSection === "profile"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Profile
              </button>
              <button
                onClick={() => setActiveSection("history")}
                className={`${
                  activeSection === "history"
                    ? "border-black text-black"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Service & Payment History
              </button>
            </nav>
          </div>

          {/* Profile Section */}
          {activeSection === "profile" && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              {/* Profile Header */}
              <div className="bg-black p-6 text-white">
                <div className="flex flex-col items-center">
                  <div className="w-32 h-32 bg-white rounded-full overflow-hidden border-4 border-white shadow-md">
                    <img
                      src={userData.profile_image_url || defaultProfileImage }
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h1 className="text-2xl font-bold mt-4">{userData.username}</h1>
                  <p className="text-sm">{userData.email}</p>
                </div>
              </div>

              {/* Profile Details */}
              <div className="p-6">
                <h2 className="text-lg font-semibold text-black mb-4">Contact Details</h2>
                <div className="space-y-4 text-black">
                  <p>
                    <span className="font-semibold">Email:</span> {userData.email}
                  </p>
                  <p>
                    <span className="font-semibold">Phone:</span> +91 {userData.phone}
                  </p>
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
          )}

          {/* History Section */}
          {activeSection === "history" && (
            <div className="bg-white rounded-lg shadow-lg overflow-hidden p-6">
              <UserRequestHistory />
            </div>
          )}

          {isModalOpen && (
            <EditProfileModal
              userData={userData}
              onClose={() => setIsModalOpen(false)}
              onProfileUpdate={fetchUserProfile} // Refetch profile data after update
            />
          )}
        </div>
      </div>
      <Footer />
    </div>
  )
}
