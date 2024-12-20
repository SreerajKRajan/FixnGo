import { FaComments, FaVideo, FaUser } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { logout } from "../../store/userAuthSlice";
import { Link } from "react-router-dom";

export default function Header({ onLogout }) {
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
    onLogout();
  };

  return (
    <header className="bg-black text-white p-4">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold">FixNgo</h1>
        <div className="flex items-center space-x-4">
          <button className="p-2 rounded-full bg-black hover:bg-gray-800">
            <FaComments />
          </button>
          <button className="p-2 rounded-full bg-black hover:bg-gray-800">
            <FaVideo />
          </button>
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
