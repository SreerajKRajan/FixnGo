import React, { useEffect, useState } from "react";
import WorkshopHeader from "@/components/Workshop/WorkshopHeader";
import WorkshopFooter from "@/components/Workshop/WorkshopFooter";
import { logout } from "../../store/workshopAuthSlice";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import UserRequestsPage from "@/components/Workshop/ServiceManagement/UserRequestsPage";
import ChatModal from "../WorkshopChatModal"; // Import the ChatModal component
import { IoChatbubbleEllipses } from "react-icons/io5";

const WorkshopHomePage = () => {
  const [activeTab, setActiveTab] = useState("requests");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  
  const { workshopId } = useParams(); // Get workshop ID from URL
  const userId = useSelector((state) => state.userAuth.user?.id); // Get logged-in user ID

  // Chat modal states
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [baseUrl, setBaseUrl] = useState("");

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

  const handleChatClick = () => {
    console.log("User ID:", userId);
    console.log("Workshop ID:", WorkshopId);
  
    if (!userId || !WorkshopId) {
      console.error("Missing userId or WorkshopId. Cannot create room name.");
      return;
    }
  
    setRoomName(`room_${userId}_${WorkshopId}`);
    setBaseUrl("127.0.0.1:8001");
    setChatModalOpen(true);
  };
  

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


      {/* Chat Modal */}
      {chatModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 bg-black bg-opacity-50"
            onClick={() => setChatModalOpen(false)}
          />
          <div className="relative bg-white rounded-lg shadow-xl w-full max-w-md mx-4">
            <ChatModal
              isOpen={chatModalOpen}
              onClose={() => setChatModalOpen(false)}
              baseUrl={baseUrl}
              roomName={roomName}
            />
          </div>
        </div>
      )}

      <WorkshopFooter />
    </div>
  );
};

export default WorkshopHomePage;
