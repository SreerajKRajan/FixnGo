import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import axiosInstance from "../../utils/axiosInstance";

export function Navbar() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const adminToken = localStorage.getItem("adminToken");
      await axiosInstance.post("/admin_side/logout/", {}, {
        headers: {
          Authorization: `Bearer ${adminToken}`,
        },
      });
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
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-semibold">Admin Dashboard</span>
            </div>
          </div>
          <div className="flex items-center">
            <Button variant="ghost" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
