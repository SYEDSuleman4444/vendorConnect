import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

const customIcon = new L.Icon({
  iconUrl: "/marker.png",
  iconSize: [52, 52],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});


// Component to update the map center dynamically
const UpdateCenter = ({ center }) => {
  const map = useMap();
  map.setView(center, 15); // Zoom level 18 for better focus
  return null;
};

const CustomerInterface = () => {
  const [vendors, setVendors] = useState([]);
  const [mapCenter, setMapCenter] = useState([17.3850, 78.4867]); // Default: Hyderabad
  const [zoom, setZoom] = useState(18);

  useEffect(() => {
    // Fetch user's current location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]); // Set map to user's location
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    // Fetch vendors from the database
    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vendors");
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    fetchVendors();
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h2>Vendor Dashboard</h2>

      {/* Vendor List Section */}
      <div style={{ marginBottom: "20px" }}>
        <h3>All Vendors</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {vendors.map((vendor) => (
            <li
              key={vendor._id}
              style={{
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
              }}
            >
              <strong>Business Name:</strong> {vendor.businessName} <br />
              <strong>Owner:</strong> {vendor.name} <br />
              <strong>Email:</strong> {vendor.email} <br />
              <strong>Phone:</strong> {vendor.phone} <br />
              <strong>Location:</strong> Latitude {vendor.location.coordinates[1]}, Longitude{" "}
              {vendor.location.coordinates[0]}
            </li>
          ))}
        </ul>
      </div>

      {/* Map Section */}
      <div style={{ height: "500px", width: "100%", marginTop: "20px" }}>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: "100%", width: "100%" }}>
          <UpdateCenter center={mapCenter} /> {/* Keeps map centered on user */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {vendors.map((vendor) => (
            <Marker
              key={vendor._id}
              position={[
                vendor.location.coordinates[1], // Latitude
                vendor.location.coordinates[0], // Longitude
              ]}
              icon={customIcon}
            >
              <Popup>
                <strong>{vendor.businessName}</strong> <br />
                Owner: {vendor.name} <br />
                Email: {vendor.email} <br />
                Phone: {vendor.phone}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default CustomerInterface;
