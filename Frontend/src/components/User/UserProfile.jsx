import { useDispatch } from "react-redux";
import { logout } from "../../store/userAuthSlice";
import { useNavigate } from "react-router-dom";


export default function UserProfile() {

    const dispatch = useDispatch()
    const navigate = useNavigate()

    const handleLogout = () => {
        dispatch(logout())
        navigate("/login")
    }
  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center p-4">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-500 to-blue-400 p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="w-24 h-24 bg-white rounded-full overflow-hidden">
              <img
                src="https://via.placeholder.com/150"
                alt="Profile"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Sreeraj K R</h1>
              <p className="text-sm">sreerajkrajan03@gmail.com</p>
              <p className="text-sm">Member since: Jan 2023</p>
            </div>
          </div>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h2 className="text-lg font-semibold">Personal Details</h2>
            <div className="mt-2 text-gray-600 space-y-1">
              <p><span className="font-bold">Phone:</span> +1 234 567 890</p>
              <p><span className="font-bold">Address:</span> 123 Main St, City, Country</p>
            </div>
          </div>
          <div>
            <h2 className="text-lg font-semibold">Preferences</h2>
            <div className="mt-2 text-gray-600 space-y-1">
              <p><span className="font-bold">Language:</span> English</p>
              <p><span className="font-bold">Theme:</span> Dark Mode</p>
            </div>
          </div>
          <div className="col-span-2">
            <h2 className="text-lg font-semibold">About</h2>
            <p className="mt-2 text-gray-600">
              Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed vel arcu nisi. 
              Proin luctus lacus non lectus fringilla, nec interdum lacus pellentesque.
            </p>
          </div>
        </div>
        <div className="p-6 border-t flex justify-end gap-4">
          <button className="bg-blue-500 hover:bg-blue-400 text-white px-4 py-2 rounded-lg">
            Edit Profile
          </button>
          <button onClick={handleLogout} className="bg-gray-300 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg">
            Logout
          </button>
        </div>
      </div>
    </div>
  );
}
