import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";
import UserIconUrl from "../../assets/map_icons/location-red.png"
import WorkshopIconUrl from "../../assets/map_icons/location-blue.png"

// Custom icons
const userIcon = L.icon({
  iconUrl: WorkshopIconUrl, // Replace with the path to your user icon
  iconSize: [32, 32], // Adjust size as needed
});

const workshopIcon = L.icon({
  iconUrl: UserIconUrl, // Replace with the path to your workshop icon
  iconSize: [62, 62], // Adjust size as needed
});

const MapComponent = ({ userLocation, workshops }) => {
  const [position, setPosition] = useState([51.505, -0.09]); // Default position

  useEffect(() => {
    if (userLocation && typeof userLocation.lat === "number" && typeof userLocation.lng === "number") {
      setPosition([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Filter workshops with valid latitude and longitude
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
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%", zIndex: 1 }}
      className="map-container"
    >
      <ChangeView center={position} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {/* User Location Marker */}
      {userLocation && (
        <Marker
          position={[userLocation.lat, userLocation.lng]}
          icon={userIcon}
        >
          <Popup>You are here</Popup>
        </Marker>
      )}
      {/* Workshop Markers */}
      {Array.isArray(workshops) && (
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
      )}
    </MapContainer>
  );
};

export default MapComponent;