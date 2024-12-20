import { FaSearch } from "react-icons/fa";

export default function SearchBar() {
  return (
    <div className="bg-black text-white rounded-lg shadow-md p-1 mb-8">
      <div className="flex items-center">
        <input
          type="text"
          placeholder="Search for nearby workshops..."
          className="flex-grow p-2 border border-white rounded-l-md focus:outline-none text-black"
        />
        <button className="bg-white text-black p-2 rounded-r-md hover:bg-gray-200">
          <FaSearch />
        </button>
      </div>
    </div>
  );
}
