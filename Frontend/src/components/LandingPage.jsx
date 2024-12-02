import { Link } from "react-router-dom";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-200">
      <h1 className="text-4xl font-bold mb-4 text-gray-800">
        Welcome to FixnGo
      </h1>
      <p className="text-gray-600 text-center mb-6">
        Your trusted automobile repair service platform.
      </p>
      <div className="space-x-4">
        <Link
          to="/login"
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Login
        </Link>
        <Link
          to="/signup"
          className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-900"
        >
          Sign Up
        </Link>
      </div>
    </div>
  );
}
