import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./VendorInterface.css"; // Import the CSS file

const VendorInterface = () => {
  const [vendor, setVendor] = useState(null);
  const [products, setProducts] = useState([]);
  const [newProduct, setNewProduct] = useState({ name: "", price: "" });
  const navigate = useNavigate();

  useEffect(() => {
    const vendorId = localStorage.getItem("vendorId");
    if (!vendorId) {
      navigate("/VendorForm");
      return;
    }

    // Fetch vendor details
    axios
      .get(`http://localhost:5000/api/vendor/${vendorId}`)
      .then((res) => {
        console.log('Fetched vendor data:', res.data); // Debug vendor data
        setVendor(res.data);
      })
      .catch((err) => console.error("Error fetching vendor:", err));

    // Fetch vendor's products
    axios
      .get(`http://localhost:5000/api/products/${vendorId}`)
      .then((res) => {
        console.log('Fetched products:', res.data); // Debug product data
        setProducts(res.data);
      })
      .catch((err) => console.error("Error fetching products:", err));
  }, [navigate]);

  const addProduct = async () => {
    try {
      console.log('Adding product:', newProduct); // Debug the product being added

      const vendorId = localStorage.getItem("vendorId");
      const response = await axios.post("http://localhost:5000/api/products", {
        vendorId,
        name: newProduct.name,
        price: newProduct.price,
      });

      console.log('Added product:', response.data); // Check what the response contains

      // Update the products list after adding the new product
      setProducts((prevProducts) => [...prevProducts, response.data]);

      // Clear the input fields
      setNewProduct({ name: "", price: "" });

      // Refresh the page to show the new product
      window.location.reload();
    } catch (error) {
      console.error("Error adding product:", error);
    }
  };

  const deleteProduct = async (productId) => {
    try {
      console.log('Deleting product with ID:', productId);
      await axios.delete(`http://localhost:5000/api/products/${productId}`);
      setProducts(products.filter((product) => product._id !== productId));
    } catch (error) {
      console.error("Error deleting product:", error);
    }
  };

  return (
    <div className="vendor-container">
      <h1>Welcome, {vendor?.name || "Vendor"}!</h1>
      <h2>Manage Your Products</h2>
      
      <div className="product-form">
        <input
          type="text"
          placeholder="Product Name"
          value={newProduct.name}
          onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
        />
        <input
          type="number"
          placeholder="Price"
          value={newProduct.price}
          onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
        />
        <button onClick={addProduct}>Add Product</button>
      </div>

      <ul className="product-list">
        {products.length > 0 ? (
          products.map((product) => (
            <li key={product._id} className="product-item">
              <span className="product-name">{product.name || "Unnamed Product"}</span>
              <span className="product-price">₹{product.price || "0"}</span>
              <button className="delete-btn" onClick={() => deleteProduct(product._id)}>
                Delete
              </button>
            </li>
          ))
        ) : (
          <li>No products available.</li>
        )}
      </ul>
    </div>
  );
};

export default VendorInterface;
