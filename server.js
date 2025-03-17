const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/vendorCustomerDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "❌ MongoDB Connection Error:"));
db.once("open", () => console.log("✅ Connected to MongoDB"));

// ✅ Vendor Schema
const vendorSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  businessName: { type: String, required: true },
  location: {
    type: { type: String, enum: ["Point"], default: "Point" },
    coordinates: { type: [Number], required: true },
  },
});
const Vendor = mongoose.model("Vendor", vendorSchema);

// ✅ Register a Vendor (POST)
app.post("/api/vendors", async (req, res) => {
  try {
    console.log("➡️ Received Vendor Data:", req.body);

    const { name, email, phone, businessName, location } = req.body;

    if (!name || !email || !phone || !businessName || !location || !location.latitude || !location.longitude) {
      return res.status(400).json({ error: "❌ All fields are required." });
    }

    const vendor = new Vendor({
      name,
      email,
      phone,
      businessName,
      location: {
        type: "Point",
        coordinates: [parseFloat(location.longitude), parseFloat(location.latitude)],
      },
    });

    const savedVendor = await vendor.save();
    res.status(201).json({
      message: "✅ Vendor registered successfully!",
      vendorId: savedVendor._id,
    });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "❌ Failed to register vendor. Try again." });
  }
});

// ✅ Vendor Login (POST)
app.post("/api/vendor-login", async (req, res) => {
  try {
    const { email, name } = req.body;

    // Find vendor by email & name
    const vendor = await Vendor.findOne({ email: email.trim(), name: name.trim() });

    if (!vendor) {
      return res.status(404).json({ error: "❌ Vendor not found, please register." });
    }

    res.status(200).json({ message: "✅ Login successful!", vendor });
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "❌ Failed to login. Try again." });
  }
});

// ✅ Get Vendor by ID (GET) [FIXED]
app.get("/api/vendors/:id", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.id);

    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found." });
    }

    res.status(200).json(vendor);
  } catch (error) {
    console.error("❌ Server Error:", error);
    res.status(500).json({ error: "Failed to fetch vendor details." });
  }
});

// ✅ Start Server
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
