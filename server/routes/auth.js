const express = require("express");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { protect } = require("../middleware/auth");
const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "30d",
  });
};

// Register Buyer
router.post("/register/buyer", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "buyer",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Register Seller
router.post("/register/seller", async (req, res) => {
  try {
    const { name, email, password, storeName, storeDescription, phone } =
      req.body;

    if (!storeName) {
      return res
        .status(400)
        .json({ message: "Store name is required for sellers" });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role: "seller",
      storeName,
      storeDescription: storeDescription || "",
      phone: phone || "",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        storeName: user.storeName,
        storeDescription: user.storeDescription,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Generic Register (backward compatibility)
router.post("/register", async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      role = "buyer",
      storeName,
      storeDescription,
    } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    if (role === "seller" && !storeName) {
      return res
        .status(400)
        .json({ message: "Store name is required for sellers" });
    }

    const userData = { name, email, password, role };
    if (role === "seller") {
      userData.storeName = storeName;
      userData.storeDescription = storeDescription || "";
    }

    const user = await User.create(userData);

    if (user) {
      const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      };

      if (user.role === "seller") {
        response.storeName = user.storeName;
        response.storeDescription = user.storeDescription;
      }

      res.status(201).json(response);
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      const response = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        isAdmin: user.isAdmin,
        token: generateToken(user._id),
      };

      if (user.role === "seller") {
        response.storeName = user.storeName;
        response.storeDescription = user.storeDescription;
      }

      res.json(response);
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get user profile
router.get("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update user profile
router.put("/profile", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;

      if (user.role === "seller") {
        user.storeName = req.body.storeName || user.storeName;
        user.storeDescription =
          req.body.storeDescription || user.storeDescription;
      }

      if (req.body.password) {
        user.password = req.body.password;
      }

      const updatedUser = await user.save();

      const response = {
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        phone: updatedUser.phone,
        isAdmin: updatedUser.isAdmin,
        token: generateToken(updatedUser._id),
      };

      if (updatedUser.role === "seller") {
        response.storeName = updatedUser.storeName;
        response.storeDescription = updatedUser.storeDescription;
      }

      res.json(response);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

module.exports = router;
