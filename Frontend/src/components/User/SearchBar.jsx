import React, { useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { FaLocationCrosshairs } from "react-icons/fa6";

const SearchBar = ({ onLocationSelect }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);

  const fetchSuggestions = async (value) => {
    try {
      const response = await axios.get(
        `https://nominatim.openstreetmap.org/search?q=${value}&format=json&addressdetails=1&limit=5`,
        { headers: { "Accept-Language": "en" } }
      );
      setSuggestions(response.data);
    } catch (error) {
      console.error("Error fetching suggestions:", error);
    }
  };

  const debouncedFetchSuggestions = useCallback(
    debounce((value) => fetchSuggestions(value), 300),
    []
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length > 2) {
      debouncedFetchSuggestions(value);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.display_name);
    setSuggestions([]);
    onLocationSelect({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
  };

  const detectCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          onLocationSelect({ lat: latitude, lng: longitude });
  
          // Reverse Geocoding to get location name
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { "Accept-Language": "en" } } // Force English language
            );
            setQuery(response.data.display_name || "Your Location");
          } catch (error) {
            console.error("Error in reverse geocoding:", error);
            setQuery("Unknown Location");
          }
        },
        (error) => {
          console.error("Error detecting location:", error);
          alert("Unable to detect your location. Please try again.");
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };
  

  return (
    <div className="relative">
      <input
        type="text"
        value={query}
        onChange={handleSearchChange}
        placeholder="Enter your location"
        className="w-full p-2 border rounded"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border mt-1 w-full z-10 max-h-60 overflow-auto">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-2 hover:bg-gray-200 cursor-pointer"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
      <button
        className="mt-2 px-4 py-2 bg-red-500 text-white rounded shadow-md hover:bg-red-600 transition duration-300 ease-in-out flex items-center justify-center gap-2"
        onClick={detectCurrentLocation}
      >
        <FaLocationCrosshairs />
        Detect Current Location
      </button>
    </div>
  );
};

export default SearchBar;
