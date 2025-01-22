import React, { useCallback, useState } from "react";
import { FaUser } from "react-icons/fa";
import { IoIosNotifications } from "react-icons/io";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../../store/userAuthSlice";
import { Link, useNavigate } from "react-router-dom";
import useSocket from "../../utils/useSocket";

export default function Header() {
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const userId = useSelector((state) => state.userAuth.user?.id);

  const handleNotification = useCallback((data) => {
    setNotifications((prev) => [
      {
        id: Date.now(),
        message: data.message,
        timestamp: new Date(),
        isRead: false,
      },
      ...prev,
    ]);
  }, []);

  useSocket(userId, handleNotification);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  const toggleNotifications = () => {
    setIsNotificationOpen((prev) => !prev);
  };

  const clearNotification = (id) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  };

  const clearAllNotifications = () => {
    setNotifications([]);
  };


  return (
    <header className="bg-black text-white p-4 relative">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">FixNgo</h1>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              className="p-2 rounded-full bg-black hover:bg-gray-800 relative"
              onClick={toggleNotifications}
            >
              <IoIosNotifications size={24} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-72 bg-white text-black shadow-lg rounded-lg p-4 z-50">
                <div className="flex justify-between items-center">
                  {notifications.length > 0 &&(
                  <button
                  className="text-sm text-red-500 hover:underline"
                  onClick={clearAllNotifications}
                >
                  Clear All
                </button>
                  )}
                </div>
                <ul className="space-y-2 max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <li
                        key={notification.id}
                        className="bg-gray-100 p-2 rounded hover:bg-gray-200 flex justify-between items-center"
                      >
                        <span>{notification.message}</span>
                        <button
                          className="text-red-500 text-sm hover:underline"
                          onClick={() => clearNotification(notification.id)}
                        >
                          Clear
                        </button>
                      </li>
                    ))
                  ) : (
                    <li className="text-gray-500">No notifications</li>
                  )}
                </ul>
              </div>
            )}
          </div>
          <button className="p-2 rounded-full bg-black hover:bg-gray-800">
            <Link
              to="/user-profile"
              className="text-white flex items-center justify-center"
            >
              <FaUser size={20} />
            </Link>
          </button>
          <button
            onClick={handleLogout}
            className="bg-gray-300 text-black py-1 px-3 rounded-md hover:bg-gray-400 transition duration-300"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
