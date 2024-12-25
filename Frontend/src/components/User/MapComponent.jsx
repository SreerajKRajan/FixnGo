import React, { useState, useRef, useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from "react-leaflet"; // React-Leaflet imports
import L from "leaflet";

const MapComponent = ({ setLocation }) => {
  const [position, setPosition] = useState([51.505, -0.09]); // Default lat/lng

  // This will allow us to capture the click event on the map
  function LocationMarker() {
    useMapEvents({
      click(e) {
        setPosition([e.latlng.lat, e.latlng.lng]);
        setLocation(e.latlng); // Pass the selected location
      }
    });

    return position === null ? null : (
      <Marker position={position}>
        <Popup>You are here</Popup>
      </Marker>
    );
  }

  return (
    // Ensure the MapContainer fills the available space
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }} // Ensure it takes full size of the parent container
      className="map-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <LocationMarker />
    </MapContainer>
  );
};

export default MapComponent;
