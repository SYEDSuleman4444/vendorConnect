import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const VendorLogin = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/vendor-login", {
        email: email.trim(),
        name: name.trim(),
      });

      if (response.data && response.data.vendor) {
        const vendorId = response.data.vendor._id;
        console.log("✅ Vendor ID stored:", vendorId); // Debugging log
        localStorage.setItem("vendorId", vendorId);
        navigate("/vendor-interface");
      } else {
        setError("❌ Login failed. Vendor not found.");
      }
    } catch (error) {
      console.error("❌ Login Error:", error);
      setError(error.response?.data?.error || "❌ Login failed. Try again.");
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Vendor Login</h1>
      <form onSubmit={handleLogin} style={{ display: "inline-block", textAlign: "left" }}>
        <label>Name:</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />
        <br />
        <label>Email:</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <br />
        <button type="submit" style={{ marginTop: "10px", padding: "10px", cursor: "pointer" }}>
          Login
        </button>
      </form>
      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
};

export default VendorLogin;
