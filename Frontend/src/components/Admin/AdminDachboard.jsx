import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { DashboardContent } from "./DashboardContent";
import { UserList } from "./UserList";
import { WorkshopList } from "./WorkshopList";
import { ServiceList } from "./ServiceList";
import { WorkshopServiceList } from "./WorkshopServiceList";

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("adminActiveTab") || "dashboard"
  );

  useEffect(() => {
    localStorage.setItem("adminActiveTab", activeTab);
  }, [activeTab]);

  return (
    <div className="flex h-screen bg-white">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-white p-6">
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
    <div className="w-64 bg-black text-white shadow-md">
      <div className="p-4">
        <h2 className="text-2xl font-bold text-white">Admin Panel</h2>
      </div>
      <nav className="mt-4">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex items-center w-full px-4 py-2 text-sm font-medium rounded-md ${
              activeTab === item.id
                ? "bg-white text-black"
                : "text-gray-300 hover:bg-gray-800"
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
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActiveSubTab("serviceList")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeSubTab === "serviceList"
              ? "bg-black text-white"
              : "bg-gray-200 text-black"
          }`}
        >
          Service List
        </button>
        <button
          onClick={() => setActiveSubTab("workshopServiceList")}
          className={`px-4 py-2 text-sm font-medium rounded-md ${
            activeSubTab === "workshopServiceList"
              ? "bg-black text-white"
              : "bg-gray-200 text-black"
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
