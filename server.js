const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
app.use(bodyParser.json());
app.use(cors({
  origin: ["http://localhost:3000", "http://localhost:3001"], // Allow requests from both ports
  methods: ["GET", "POST", "DELETE"], // Define allowed HTTP methods
}));

// ✅ MongoDB Connection
mongoose
  .connect("mongodb://127.0.0.1:27017/vendorCustomerDB", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("✅ Connected to MongoDB"))
  .catch((err) => console.error("❌ MongoDB Connection Error:", err));

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

// ✅ Product Schema
const productSchema = new mongoose.Schema({
  vendorId: { type: mongoose.Schema.Types.ObjectId, ref: "Vendor", required: true },
  name: { type: String, required: true },
  price: { type: Number, required: true },
});
const Product = mongoose.model("Product", productSchema);

// ✅ Vendor Registration (Added Fix)
app.post("/api/vendors", async (req, res) => {
  try {
    const { name, email, phone, businessName, location } = req.body;

    // Validate data
    if (!name || !email || !phone || !businessName || !location) {
      return res.status(400).json({ error: "❌ All fields are required." });
    }

    // Convert location to proper GeoJSON format
    const formattedLocation = {
      type: "Point",
      coordinates: [location.longitude, location.latitude], // MongoDB expects [longitude, latitude]
    };

    // Check if email already exists
    const existingVendor = await Vendor.findOne({ email });
    if (existingVendor) {
      return res.status(400).json({ error: "❌ Email already registered." });
    }

    const newVendor = new Vendor({
      name,
      email,
      phone,
      businessName,
      location: formattedLocation,
    });

    await newVendor.save();
    res.status(201).json({ vendorId: newVendor._id, message: "✅ Vendor registered successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "❌ Failed to register vendor. Try again." });
  }
});

// ✅ Vendor Login
app.post("/api/vendor-login", async (req, res) => {
  try {
    const { email, name } = req.body;
    const vendor = await Vendor.findOne({ email: email.trim(), name: name.trim() });

    if (!vendor) {
      return res.status(404).json({ error: "❌ Vendor not found, please register." });
    }

    res.status(200).json({ message: "✅ Login successful!", vendor });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to login. Try again." });
  }
});

// ✅ Get Vendor Details
app.get("/api/vendor/:vendorId", async (req, res) => {
  try {
    const vendor = await Vendor.findById(req.params.vendorId);
    if (!vendor) {
      return res.status(404).json({ error: "Vendor not found" });
    }
    res.status(200).json(vendor);
  } catch (error) {
    res.status(500).json({ error: "Server error, try again" });
  }
});
// ✅ Customer Login
app.post("/api/customer-login", async (req, res) => {
  try {
    const { email, name } = req.body;

    // Validate data
    if (!email || !name) {
      return res.status(400).json({ error: "❌ Email and name are required." });
    }

    // Find customer by email and name
    const customer = await Customer.findOne({ email: email.trim(), name: name.trim() });

    if (!customer) {
      return res.status(404).json({ error: "❌ Customer not found, please register." });
    }

    res.status(200).json({ message: "✅ Login successful!", customer });
  } catch (error) {
    console.error("❌ Customer Login Error:", error);
    res.status(500).json({ error: "❌ Failed to login. Try again." });
  }
});
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({});
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "❌ Failed to fetch products." });
  }
});


// ✅ Correct API Route for Fetching Vendors
app.get("/api/vendors", async (req, res) => {
  try {
    const vendors = await Vendor.find({});
    res.json(vendors);
  } catch (error) {
    console.error("Error fetching vendors:", error);
    res.status(500).json({ error: "Server error" });
  }
});
// ✅ Product Management Routes

// Add Product (Ensures Collection Exists)
app.post("/api/products", async (req, res) => {
  try {
    const { vendorId, name, price } = req.body;
    if (!vendorId || !name || !price) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const vendorExists = await Vendor.findById(vendorId);
    if (!vendorExists) {
      return res.status(404).json({ error: "Vendor not found" });
    }

    const product = new Product({ vendorId, name, price });
    await product.save();
    res.status(201).json({ message: "✅ Product added successfully!", product });
  } catch (error) {
    res.status(500).json({ error: "❌ Server error, try again." });
  }
});

// Get Products for a Vendor
app.get("/api/products/:vendorId", async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Server error, try again" });
  }
});

// Delete Product
app.delete("/api/products/:productId", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(200).json({ message: "✅ Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "❌ Server error, try again" });
  }
});


// ✅ Route to Fetch Products by Vendor ID
app.get("/api/products/vendor/:vendorId", async (req, res) => {
  try {
    const products = await Product.find({ vendorId: req.params.vendorId });
    if (!products || products.length === 0) {
      return res.status(404).json({ error: "No products found for this vendor." });
    }
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products for vendor:", error);
    res.status(500).json({ error: "❌ Server error, try again." });
  }
});


// ✅ Customer Schema & Registration (Added)
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
});
const Customer = mongoose.model("Customer", customerSchema);

app.get("/api/customers-by-messages/:vendorId", async (req, res) => {
  try {
    const { vendorId } = req.params;

    // Find all chats with the vendor as the receiver
    const chats = await Chat.find({ receiverId: vendorId }).distinct("senderId");

    // Retrieve customer details using sender IDs
    const customers = await Customer.find({ _id: { $in: chats } });

    res.status(200).json(customers);
  } catch (error) {
    console.error("Error fetching customers by messages:", error);
    res.status(500).json({ error: "Failed to fetch customers by messages." });
  }
});



app.post("/api/customers", async (req, res) => {
  try {
    const { name, email, phone } = req.body;
    if (!name || !email || !phone) {
      return res.status(400).json({ error: "❌ All fields are required." });
    }

    const existingCustomer = await Customer.findOne({ email });
    if (existingCustomer) {
      return res.status(400).json({ error: "❌ Email already registered." });
    }

    const newCustomer = new Customer({ name, email, phone });
    await newCustomer.save();
    res.status(201).json({ message: "✅ Customer registered successfully!", customerId: newCustomer._id });
  } catch (error) {
    res.status(500).json({ error: "❌ Failed to register customer. Try again." });
  }
});
const chatSchema = new mongoose.Schema({
  senderId: { type: mongoose.Schema.Types.ObjectId, required: true },
  receiverId: { type: mongoose.Schema.Types.ObjectId, required: true },
  message: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
});

chatSchema.index({ timestamp: 1 }, { expireAfterSeconds: 3600 }); // Expire messages after 1 hour

const Chat = mongoose.model("Chat", chatSchema);
app.get("/api/chats", async (req, res) => {
  try {
    const { senderId, receiverId } = req.query;

    const chats = await Chat.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });

    res.status(200).json(chats);
  } catch (error) {
    console.error("Error fetching chats:", error);
    res.status(500).json({ error: "❌ Failed to fetch chats." });
  }
});
const userSocketMap = {}
// ✅ Start WebSocket Server
const server = http.createServer(app); // Create HTTP server
const io = new Server(server, {
  cors: {
    origin: "*", // Allow all origins
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

   // Register user with their user ID
   socket.on("registerUser", (userId) => {
    Object.keys(userSocketMap).forEach((key) => {
      if (key === userId) {
        delete userSocketMap[key];
      }
    });
    userSocketMap[userId] = socket.id;
    console.log(`User ${userId} registered with socket ${socket.id}`);
  });

  // Listen for new messages
  socket.on("sendMessage", async (data) => {
    try {
      const { senderId, receiverId, message } = data;

      // Save message to database
      const newChat = new Chat({ senderId, receiverId, message });
      await newChat.save();

      // Emit message to receiver
      const receiverSocketId = userSocketMap[receiverId];
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", newChat);
      } else {
        console.log(`User ${receiverId} is not connected.`);
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  });

  // Handle user disconnect
  socket.on("disconnect", () => {
    // Remove user from mapping
    Object.keys(userSocketMap).forEach((userId) => {
      if (userSocketMap[userId] === socket.id) {
        delete userSocketMap[userId];
        console.log(`User ${userId} disconnected`);
      }
    });
  });
});
// ✅ Start Server
const PORT = 5000;
server.listen(PORT, () => {
  console.log(`🚀 Server running at: http://localhost:${PORT}`);
});
