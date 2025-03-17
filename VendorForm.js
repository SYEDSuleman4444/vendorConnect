import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VendorForm = () => {
  const [vendor, setVendor] = useState({
    name: "",
    email: "",
    phone: "",
    businessName: "",
    latitude: "",
    longitude: "",
  });

  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setVendor({ ...vendor, [e.target.name]: e.target.value });
  };

  const fetchLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setVendor({
            ...vendor,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          setMessage("❌ Location error: " + error.message);
        }
      );
    } else {
      setMessage("❌ Geolocation is not supported.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();

    if (!vendor.name || !vendor.email || !vendor.phone || !vendor.businessName || !vendor.latitude || !vendor.longitude) {
      setMessage("❌ Please fill all fields and get location.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5000/api/vendors", {
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        businessName: vendor.businessName,
        location: {
          latitude: parseFloat(vendor.latitude),
          longitude: parseFloat(vendor.longitude),
        },
      });

      if (response.data.vendorId) {
        setMessage("✅ Vendor registered successfully!");
        setVendor({ name: "", email: "", phone: "", businessName: "", latitude: "", longitude: "" });
        setTimeout(() => navigate("/vendor-login"), 1500);
      } else {
        setMessage("❌ Error: Vendor ID missing in response.");
      }
    } catch (error) {
      setMessage("❌ Failed to register vendor. Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Vendor Registration</h2>
      {message && <p style={{ color: message.startsWith("✅") ? "green" : "red" }}>{message}</p>}
      
      <form onSubmit={handleRegister}>
        <input type="text" name="name" placeholder="Name" value={vendor.name} onChange={handleChange} required />
        <input type="email" name="email" placeholder="Email" value={vendor.email} onChange={handleChange} required />
        <input type="text" name="phone" placeholder="Phone" value={vendor.phone} onChange={handleChange} required />
        <input type="text" name="businessName" placeholder="Business Name" value={vendor.businessName} onChange={handleChange} required />
        <input type="text" placeholder="Latitude" value={vendor.latitude} readOnly />
        <input type="text" placeholder="Longitude" value={vendor.longitude} readOnly />
        <button type="button" onClick={fetchLocation}>Get Location</button>
        <button type="submit">Register Vendor</button>
      </form>

      {/* ✅ Added Login Button */}
      <button onClick={() => navigate("/vendor-login")}>Already a Vendor? Login Here</button>
    </div>
  );
};

export default VendorForm;
