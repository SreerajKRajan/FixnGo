import React, { useState, useEffect } from "react";
import { Navbar } from "./Navbar";
import { DashboardContent } from "./DashboardContent";
import { UserList } from "./UserList";
import { WorkshopList } from "./WorkshopList";

export function AdminDashboard() {
  // Retrieve the active tab from localStorage or default to "dashboard"
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("adminActiveTab") || "dashboard"
  );

  // Update localStorage whenever the active tab changes
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
