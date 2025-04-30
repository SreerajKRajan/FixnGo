import React, { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import MarkerClusterGroup from "@changey/react-leaflet-markercluster";
import L from "leaflet";
import UserIconUrl from "../../assets/map_icons/location-red.png";
import WorkshopIconUrl from "../../assets/map_icons/location-blue.png";
import { useNavigate } from "react-router-dom";

// Custom icons
const userIcon = L.icon({
  iconUrl: WorkshopIconUrl,
  iconSize: [32, 32],
});

const workshopIcon = L.icon({
  iconUrl: UserIconUrl,
  iconSize: [62, 62],
});

const MapComponent = ({ userLocation, workshops }) => {
  const navigate = useNavigate();
  const [position, setPosition] = useState([51.505, -0.09]);

  useEffect(() => {
    if (
      userLocation &&
      typeof userLocation.lat === "number" &&
      typeof userLocation.lng === "number"
    ) {
      setPosition([userLocation.lat, userLocation.lng]);
    }
  }, [userLocation]);

  // Filter workshops with valid coordinates
  const validWorkshops = workshops.filter(
    (workshop) =>
      typeof workshop.latitude === "number" &&
      typeof workshop.longitude === "number"
  );

  // Slightly offset markers if same location exists
  const locationCount = {};
  const getOffsetLatLng = (lat, lng) => {
    const key = `${lat},${lng}`;
    const count = locationCount[key] || 0;
    const offset = 0.00005 * count; // ~5 meters
    locationCount[key] = count + 1;
    return [lat + offset, lng + offset];
  };

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

      {/* User Marker */}
      {userLocation && (
        <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
          <Popup>You are here</Popup>
        </Marker>
      )}

      {/* Workshop Markers with Clustering */}
      {Array.isArray(workshops) && (
        <MarkerClusterGroup disableClusteringAtZoom={18}>
          {validWorkshops.map((workshop, index) => {
            const offsetPosition = getOffsetLatLng(
              workshop.latitude,
              workshop.longitude
            );            
            return (
              <Marker key={index} position={offsetPosition} icon={workshopIcon}>
                <Popup>
                  <div>
                    <strong>{workshop.name}</strong>
                    <br />
                    {workshop.location}
                    <br />
                    {workshop.phone}
                    <br />
                    Distance: {workshop.distance} km
                    <br />
                    <button
                      className="text-blue-600 underline mt-1"
                      onClick={() => navigate(`/workshops/${workshop.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </Popup>
              </Marker>
            );
          })}
        </MarkerClusterGroup>
      )}
    </MapContainer>
  );
};

export default MapComponent;
