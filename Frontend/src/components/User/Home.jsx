import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { logout } from "../../store/userAuthSlice";

const Home = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Handle the logout
  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  // Prevent browser back action
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

  return (
    <div>
      <h1>Welcome to the Home Page!</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 text-white py-1 px-1 ml-3 rounded-md hover:bg-red-600 transition duration-300"
      >
        Logout
      </button>
    </div>
  );
};

export default Home;
