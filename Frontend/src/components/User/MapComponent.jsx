import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const MapComponent = ({ userLocation, workshops }) => {
  const [position, setPosition] = useState([51.505, -0.09]); // Default position

  useEffect(() => {
    if (userLocation) {
      setPosition([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  function ChangeView({ center }) {
    const map = useMap();
    map.setView(center, map.getZoom());
    return null;
  }

  return (
    <MapContainer
      center={position}
      zoom={13}
      style={{ height: "100%", width: "100%" }}
      className="map-container"
    >
      <ChangeView center={position} />
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]}>
          <Popup>You are here</Popup>
        </Marker>
      )}
      {Array.isArray(workshops) &&
        workshops.map((workshop, index) => (
          <Marker
            key={index}
            position={[workshop.lat, workshop.lng]}
          >
            <Popup>{workshop.name}</Popup>
          </Marker>
        ))}
    </MapContainer>
  );
};

export default MapComponent;
