const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// 🚨 Import the separate Admin model
 
const router = express.Router();

// Get JWT Secret from environment or use a default fallback
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
// Admin tokens typically expire faster than general user tokens
const ADMIN_TOKEN_EXPIRY = "1d"; 

// 1. Admin Registration Route (For initial setup)
router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingAdmin = await Admin.findOne({ email });
    if (existingAdmin) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    // Password hashing is handled by the pre-save hook in models/Admin.js
    const newAdmin = new Admin({ name, email, password });
    await newAdmin.save();

    res.status(201).json({ message: "Admin registered successfully" });
  } catch (err) {
    console.error('Admin registration error:', err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// 2. Admin Login Route
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find admin in the dedicated Admin collection
    const admin = await Admin.findOne({ email });
    if (!admin) return res.status(401).json({ message: "Invalid credentials" });

    // Compare password (using bcrypt.compare as Admin model handles hashing)
    const isMatch = await bcrypt.compare(password, admin.password); 
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    // JWT token payload must include role for authorization middleware checks
    const token = jwt.sign(
      { userId: admin._id, email: admin.email, role: admin.role },
      JWT_SECRET,
      { expiresIn: ADMIN_TOKEN_EXPIRY }
    );

    res.json({ 
      token, 
      // Return necessary user object for client-side state/UI management
      user: { 
        id: admin._id, 
        name: admin.name, 
        email: admin.email,
        isAdmin: true // Crucial flag for frontend routing to admin dashboard
      } 
    });
  } catch (err) {
    console.error('Admin login error:', err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// Note: Additional Admin Management routes (e.g., /stats, /users) 
// are defined in the main server.js, typically using the authorizeAdmin middleware.

module.exports = router;