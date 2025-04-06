import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import axiosInstance from "../../utils/axiosInstance";
import { DashboardContent } from "./DashboardContent";
import { UserList } from "./UserList";
import { WorkshopList } from "./WorkshopList";
import { ServiceList } from "./ServiceList";
import { WorkshopServiceList } from "./WorkshopServiceList";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("adminActiveTab") || "dashboard"
  );
  const navigate = useNavigate();

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  const handleLogout = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axiosInstance.post(
        "/admin_side/logout/",
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    } catch (error) {
      console.error("Failed to logout on the backend", error);
    } finally {
      localStorage.removeItem("adminToken");
      navigate("/admin/login");
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Header with logout button */}
        <header className="bg-white border-b border-gray-200 shadow-sm z-10">
          <div className="flex justify-between items-center px-6 py-3">
            <h1 className="text-xl font-semibold text-gray-800">
              {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h1>
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="bg-gray-800 text-white font-medium px-4 py-2 rounded-md hover:bg-gray-700 hover:text-white transition duration-200 ease-in-out"
            >
              Logout
            </Button>
          </div>
        </header>
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeTab === "dashboard" && <DashboardContent />}
          {activeTab === "users" && <UserList />}
          {activeTab === "workshops" && <WorkshopList />}
          {activeTab === "services" && <ServiceManagement />}
        </main>
      </div>
    </div>
  );
}

function Sidebar({ activeTab, setActiveTab }) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: "📊" },
    { id: "users", label: "User List", icon: "👥" },
    { id: "workshops", label: "Workshop List", icon: "🏢" },
    { id: "services", label: "Service Management", icon: "🛠️" },
  ];

  return (
    <div className="w-64 bg-gray-800 text-white shadow-lg">
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
      </div>
      <nav className="mt-6 px-3">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center w-full px-4 py-3 my-1 text-sm font-medium rounded-md transition-colors duration-150 ${
              activeTab === item.id
                ? "bg-gray-900 text-white shadow-sm"
                : "text-gray-100 hover:bg-gray-700 hover:text-white"
            }`}
          >
            <span className="mr-3">{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
    </div>
  );
}

function ServiceManagement() {
  const [activeSubTab, setActiveSubTab] = useState(
    localStorage.getItem("adminActiveSubTab") || "serviceList"
  );

  useEffect(() => {
    localStorage.setItem("adminActiveSubTab", activeSubTab);
  }, [activeSubTab]);

  const renderSubTabContent = () => {
    switch (activeSubTab) {
      case "serviceList":
        return <ServiceList />;
      case "workshopServiceList":
        return <WorkshopServiceListComponent />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div className="flex space-x-4 mb-6">
        <button
          onClick={() => setActiveSubTab("serviceList")}
          className={`px-5 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${
            activeSubTab === "serviceList"
              ? "bg-gray-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Service List
        </button>
        <button
          onClick={() => setActiveSubTab("workshopServiceList")}
          className={`px-5 py-2 text-sm font-medium rounded-md shadow-sm transition-colors duration-150 ${
            activeSubTab === "workshopServiceList"
              ? "bg-gray-600 text-white"
              : "bg-white text-gray-700 hover:bg-gray-100"
          }`}
        >
          Workshop Service List
        </button>
      </div>
      <div>{renderSubTabContent()}</div>
    </div>
  );
}

function WorkshopServiceListComponent() {
  return (
    <div>
      <WorkshopServiceList />
    </div>
  );
}