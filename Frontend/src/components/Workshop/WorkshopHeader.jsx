// src/components/WorkshopHeader.jsx
import React from "react";
import { FaComments, FaVideo, FaUser } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/workshopAuthSlice";
import { useDispatch } from "react-redux";

const WorkshopHeader = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleLogout = () =>{
    dispatch(logout())
    navigate("/workshop/login")
  }

  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">FixNgo Workshop</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
            <FaComments />
          </button>
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
            <FaVideo />
          </button>
          <button className="p-2 rounded-full bg-gray-800 hover:bg-gray-700 text-white">
            <FaUser />
          </button>
          <button
            onClick={() => navigate("/workshop/services")}
            className="bg-white text-black py-1 px-3 rounded-md hover:bg-gray-200 transition duration-300"
          >
            Service List
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-500 text-white py-1 px-3 rounded-md hover:bg-gray-600 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
};

export default WorkshopHeader;
