import React, { useState, useEffect, useCallback } from "react";
import { Input, Button } from "@nextui-org/react";
import axios from "axios";
import debounce from "lodash.debounce";
import { MapPin, Search } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";
import UserIconUrl from "../../assets/map_icons/location-red.png";
import WorkshopIconUrl from "../../assets/map_icons/location-blue.png";

// Custom icons
const userIcon = L.icon({
  iconUrl: UserIconUrl,
  iconSize: [32, 32],
});

const workshopIcon = L.icon({
  iconUrl: WorkshopIconUrl,
  iconSize: [62, 62],
});

const MapWithSearch = ({ workshops }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [position, setPosition] = useState([51.505, -0.09]); // Default position

  useEffect(() => {
    if (
      userLocation &&
      typeof userLocation.lat === "number" &&
      typeof userLocation.lng === "number"
    ) {
      setPosition([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

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
    setUserLocation({
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
    });
  };

  const detectCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });

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

  const validWorkshops = workshops.filter(
    (workshop) =>
      typeof workshop.latitude === "number" &&
      typeof workshop.longitude === "number"
  );

  function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Tabs */}
      <div className="flex mb-4">
        <Button
          className="mr-2 bg-black text-white"
          onClick={() => {}}
        >
          Map
        </Button>
        <Button
          className="bg-white text-black"
          onClick={() => {}}
        >
          Workshops
        </Button>
      </div>

      {/* Search and Map */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="w-full md:w-1/3">
          <Input
            placeholder="Search location"
            startContent={<Search size={18} />}
            value={query}
            onChange={handleSearchChange}
            endContent={
              <Button
                isIconOnly
                size="sm"
                variant="flat"
                onClick={detectCurrentLocation}
              >
                <MapPin size={18} />
              </Button>
            }
          />
          {suggestions.length > 0 && (
            <ul className="absolute bg-white border mt-2 w-full z-10 max-h-60 overflow-auto rounded-md shadow-lg">
              {suggestions.map((suggestion, index) => (
                <li
                  key={index}
                  className="p-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  {suggestion.display_name}
                </li>
              ))}
            </ul>
          )}
          <Button className="w-full mt-4" color="default">
            Find Nearby Workshops
          </Button>
        </div>
        <div className="w-full md:w-2/3 h-[400px] bg-gray-200">
          <MapContainer
            center={position}
            zoom={13}
            style={{ height: "100%", width: "100%" }}
          >
            <ChangeView center={position} />
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            {userLocation && (
              <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                <Popup>You are here</Popup>
              </Marker>
            )}
            <MarkerClusterGroup>
              {validWorkshops.map((workshop, index) => (
                <Marker
                  key={index}
                  position={[workshop.latitude, workshop.longitude]}
                  icon={workshopIcon}
                >
                  <Popup>
                    <strong>{workshop.name}</strong>
                    <br />
                    {workshop.location}
                    <br />
                    {workshop.phone}
                    <br />
                    Distance: {workshop.distance} km
                  </Popup>
                </Marker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>
    </div>
  );
};

export default MapWithSearch;
