import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VendorInterface = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");

    if (!vendorId || vendorId === "undefined") {
      alert("No vendor logged in. Redirecting to Vendor Registration.");
      navigate("/VendorForm");
      return;
    }

    console.log("Fetching vendor details for ID:", vendorId); // Debugging log

    const fetchVendor = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/vendors/${vendorId}`);

        if (response.data) {
          console.log("✅ Vendor Data Fetched:", response.data);
          setVendor(response.data);
          setError(null);
        } else {
          setError("Vendor not found.");
        }
      } catch (error) {
        console.error("Error fetching vendor data:", error);
        setError("Failed to fetch vendor details. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchVendor();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("vendorId");
    navigate("/");
  };

  if (loading) {
    return <h2 style={{ textAlign: "center", marginTop: "20px" }}>⏳ Loading vendor details...</h2>;
  }

  if (error) {
    return <h2 style={{ color: "red", textAlign: "center" }}>{error}</h2>;
  }

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome, {vendor.name}!</h1>
      <h2>Business: {vendor.businessName}</h2>
      <p>Email: {vendor.email}</p>
      <p>Phone: {vendor.phone}</p>
      <p>Location: {vendor?.location?.coordinates?.join(", ") || "Unknown"}</p>

      <button onClick={handleLogout} style={{ backgroundColor: "crimson", color: "white", padding: "10px 20px", marginTop: "20px", cursor: "pointer", borderRadius: "5px", border: "none" }}>
        Logout
      </button>
    </div>
  );
};

export default VendorInterface;
