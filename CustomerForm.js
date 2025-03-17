import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Form.css";
import background from "./bg1.jpg";

const CustomerForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const navigate = useNavigate(); // Hook for navigation

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://localhost:5000/api/customers", formData);
      alert("Customer registered successfully!");
      setFormData({ name: "", email: "", phone: "" }); // Clear the form
      navigate("/CustomerInterface"); // Redirect to Customer Interface
    } catch (error) {
      console.error("Error registering customer:", error);
      alert("Failed to register customer.");
    }
  };

  return (
    <div className="form-container"
      style={{
        backgroundImage: `url(${background})`,
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }}
    >
      <form onSubmit={handleSubmit}>
        <h2>Customer Registration</h2>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Enter your name"
          required
        />

        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="Enter your email"
          required
        />

        <label htmlFor="phone">Phone:</label>
        <input
          type="text"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          placeholder="Enter your phone number"
          required
        />

        <button
          type="submit"
          style={{
            backgroundColor: "crimson",
            color: "white",
          }}
        >
          Register
        </button>
      </form>
    </div>
  );
};

export default CustomerForm;
