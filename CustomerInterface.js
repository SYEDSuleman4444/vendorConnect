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


// Component to dynamically update the map center
const UpdateCenter = ({ center }) => {
  const map = useMap();
  map.setView(center, 15);
  return null;
};

const CustomerInterface = () => {
  const [vendors, setVendors] = useState([]);
  const [mapCenter, setMapCenter] = useState([17.385, 78.4867]);
  const [zoom, setZoom] = useState(15);
  const [listSearchTerm, setListSearchTerm] = useState("");
  const [productSearchTerm, setProductSearchTerm] = useState("");
  const [mapSearchTerm, setMapSearchTerm] = useState("");
  const [selectedVendor, setSelectedVendor] = useState(null);
  const [vendorProducts, setVendorProducts] = useState([]);
  const [showProductsPopup, setShowProductsPopup] = useState(false);
  const [allProducts, setAllProducts] = useState([]);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
        },
        (error) => console.error("Error getting location:", error),
        { enableHighAccuracy: true }
      );
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  }, []);

  useEffect(() => {
    const fetchVendors = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/vendors");
        setVendors(response.data);
      } catch (error) {
        console.error("Error fetching vendors:", error);
      }
    };

    const fetchAllProducts = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/products");
        setAllProducts(response.data);
      } catch (error) {
        console.error("Error fetching products:", error);
      }
    };

    fetchVendors();
    fetchAllProducts();
  }, []);

  const fetchVendorProducts = async (vendorId) => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products/vendor/${vendorId}`);
      setVendorProducts(response.data);
      setShowProductsPopup(true);
    } catch (error) {
      console.error("Error fetching products:", error);
      setVendorProducts([]);
      setShowProductsPopup(false);
    }
  };

  // Filter vendors based on product search
  const filteredVendors = productSearchTerm
  ? vendors.filter((vendor) =>
      allProducts.some(
        (product) =>
          product.vendorId === vendor._id &&
          product.name.toLowerCase().includes(productSearchTerm.toLowerCase())
      )
    )
  : vendors.filter(
      (vendor) =>
        vendor.businessName.toLowerCase().includes(listSearchTerm.toLowerCase()) ||
        vendor.name.toLowerCase().includes(listSearchTerm.toLowerCase())
    );


  const mapFilteredVendors = filteredVendors.filter(
    (vendor) =>
      vendor.businessName.toLowerCase().includes(mapSearchTerm.toLowerCase()) ||
      vendor.name.toLowerCase().includes(mapSearchTerm.toLowerCase())
  );

  return (
    <div style={{ display: "flex", height: "100vh", fontFamily: "Arial, sans-serif" }}>
      {/* Vendor List Section */}
      <div style={{ width: "50%", overflowY: "auto", padding: "20px", borderRight: "1px solid #ccc" }}>
        <h2>Vendor Dashboard</h2>
        <input
          type="text"
          placeholder="Search by business or owner name"
          value={listSearchTerm}
          onChange={(e) => setListSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <input
          type="text"
          placeholder="Search by product name"
          value={productSearchTerm}
          onChange={(e) => setProductSearchTerm(e.target.value)}
          style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
        />
        <h3>Vendors Selling Products</h3>
        <ul style={{ listStyleType: "none", padding: 0 }}>
          {filteredVendors.map((vendor) => (
            <li
              key={vendor._id}
              style={{
                marginBottom: "10px",
                padding: "10px",
                border: "1px solid #ccc",
                borderRadius: "5px",
                backgroundColor: "#f9f9f9",
                cursor: "pointer",
              }}
              onClick={() => {
                setSelectedVendor(vendor);
                fetchVendorProducts(vendor._id);
              }}
            >
              <strong>Business Name:</strong> {vendor.businessName} <br />
              <strong>Owner:</strong> {vendor.name} <br />
              <strong>Email:</strong> {vendor.email} <br />
              <strong>Phone:</strong> {vendor.phone} <br />
              <strong>Location:</strong> Latitude {vendor.location.coordinates[1]}, Longitude {vendor.location.coordinates[0]}
            </li>
          ))}
        </ul>
      </div>

      {/* Map Section */}
      <div style={{ width: "50%", height: "100%" }}>
        <div style={{ padding: "10px", backgroundColor: "#f8f8f8", borderBottom: "1px solid #ccc" }}>
          <input
            type="text"
            placeholder="Search vendors on map"
            value={mapSearchTerm}
            onChange={(e) => setMapSearchTerm(e.target.value)}
            style={{ width: "100%", padding: "8px" }}
          />
        </div>
        <MapContainer center={mapCenter} zoom={zoom} style={{ height: "calc(100% - 40px)", width: "100%" }}>
          <UpdateCenter center={mapCenter} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {mapFilteredVendors.map((vendor) => (
            <Marker
              key={vendor._id}
              position={[
                vendor.location.coordinates[1],
                vendor.location.coordinates[0],
              ]}
              icon={customIcon}
            >
              <Popup>
                <strong>{vendor.businessName}</strong> <br />
                Owner: {vendor.name} <br />
                Email: {vendor.email} <br />
                Phone: {vendor.phone} <br />
                <button
                  onClick={() => {
                    setSelectedVendor(vendor);
                    fetchVendorProducts(vendor._id);
                  }}
                  style={{
                    marginTop: "10px",
                    padding: "5px 10px",
                    backgroundColor: "#007bff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  View Products
                </button>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

      {/* Products Popup */}
      {showProductsPopup && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            backgroundColor: "#fff",
            border: "1px solid blue",
            borderRadius: "10px",
            padding: "20px",
            width: "40%",
            maxHeight: "70%",
            overflowY: "auto",
            boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
            zIndex: 1000,
          }}
        >
          <h2 style={{ textAlign: "center", marginBottom: "15px" }}>
            Menu for {selectedVendor?.businessName}
          </h2>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: "10px",
              border: "1px solid #ccc",
              padding: "10px",
              backgroundColor: "#f9f9f9",
            }}
          >
            <div style={{ fontWeight: "bold", textAlign: "left", borderBottom: "1px solid #ccc" }}>
              Product
            </div>
            <div style={{ fontWeight: "bold", textAlign: "right", borderBottom: "1px solid #ccc" }}>
              Price
            </div>
            {vendorProducts.map((product) => (
              <React.Fragment key={product._id}>
                <div
                  style={{
                    textAlign: "left",
                    padding: "5px 10px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  {product.name}
                </div>
                <div
                  style={{
                    textAlign: "right",
                    padding: "5px 10px",
                    borderBottom: "1px solid #ddd",
                  }}
                >
                  ₹{product.price}
                </div>
              </React.Fragment>
            ))}
          </div>
          <button
            onClick={() => setShowProductsPopup(false)}
            style={{
              padding: "10px 20px",
              marginTop: "15px",
              backgroundColor: "#007bff",
              color: "#fff",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              display: "block",
              marginLeft: "auto",
              marginRight: "auto",
            }}
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default CustomerInterface;
