import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../uis/button";
import axiosInstance from "../../utils/axiosInstance";

export function Navbar() {
  const navigate = useNavigate();

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
    <nav className="bg-gray-800 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* <div className="flex-shrink-0 flex items-center">
              <span className="text-2xl font-semibold text-white">
                Admin Dashboard
              </span>
            </div> */}
          </div>
          <div className="flex items-center">
            <Button
              variant="ghost"
              onClick={handleLogout}
              className="bg-white text-black font-semibold px-1 py-1 rounded-md shadow-md hover:bg-gray-200 transition duration-200 ease-in-out"
              >
              Logout
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
