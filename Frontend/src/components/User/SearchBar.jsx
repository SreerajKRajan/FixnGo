import React, { useState, useCallback } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { FaLocationCrosshairs } from "react-icons/fa6";
import { Input, Button, Card, Dropdown } from "@nextui-org/react";
import { MapPin, Search } from 'lucide-react';


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
  
          try {
            const response = await axios.get(
              `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json&addressdetails=1`,
              { headers: { "Accept-Language": "en" } }
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
    <div className="relative max-w-md mx-auto mt-8">
    <Card className="p-4 shadow-lg rounded-xl">
      <Input
        aria-label="Location Search"
        value={query}
        onChange={handleSearchChange}
        startContent={<Search size={18} />}
        endContent={
          <Button isIconOnly size="sm" variant="flat">
            <MapPin size={18} />
          </Button>
        }
        placeholder="Search your location"
      />
      {suggestions.length > 0 && (
        <ul className="absolute bg-white border mt-2 w-full z-10 max-h-60 overflow-auto rounded-lg shadow-lg">
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              className="p-3 hover:bg-gray-100 cursor-pointer rounded-lg"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion.display_name}
            </li>
          ))}
        </ul>
      )}
      <Button
        onClick={detectCurrentLocation}
        color="default"
        icon={<FaLocationCrosshairs />}
        className="mt-4 w-full"
      >
        Detect Current Location
      </Button>
    </Card>
  </div>
  );
};

export default SearchBar;

