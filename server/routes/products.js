const express = require("express");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Middleware to check if user is seller
const checkSeller = (req, res, next) => {
  if (req.user && (req.user.role === "seller" || req.user.isAdmin)) {
    next();
  } else {
    res.status(403).json({ message: "Access denied. Seller role required." });
  }
};

// Get all products with filtering and pagination
router.get("/", async (req, res) => {
  try {
    const pageSize = Number(req.query.pageSize) || 12;
    const page = Number(req.query.pageNumber) || 1;
    const keyword = req.query.keyword
      ? {
          $or: [
            { name: { $regex: req.query.keyword, $options: "i" } },
            { description: { $regex: req.query.keyword, $options: "i" } },
            { category: { $regex: req.query.keyword, $options: "i" } },
          ],
        }
      : {};

    const category = req.query.category
      ? { category: { $regex: req.query.category, $options: "i" } }
      : {};

    const priceRange =
      req.query.minPrice || req.query.maxPrice
        ? {
            price: {
              ...(req.query.minPrice && { $gte: Number(req.query.minPrice) }),
              ...(req.query.maxPrice && { $lte: Number(req.query.maxPrice) }),
            },
          }
        : {};

    const filter = {
      ...keyword,
      ...category,
      ...priceRange,
      isActive: true,
    };

    const count = await Product.countDocuments(filter);
    const products = await Product.find(filter)
      .populate("seller", "name storeName")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get featured products
router.get("/featured", async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isActive: true })
      .populate("seller", "name storeName")
      .limit(8)
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get products by seller
router.get("/seller/:sellerId", async (req, res) => {
  try {
    const products = await Product.find({
      seller: req.params.sellerId,
      isActive: true,
    })
      .populate("seller", "name storeName storeDescription")
      .sort({ createdAt: -1 });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's own products
router.get("/my-products", protect, checkSeller, async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user._id }).sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get single product
router.get("/:id", async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("seller", "name storeName storeDescription phone email")
      .populate("reviews.user", "name");

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create product (seller only)
router.post("/", protect, checkSeller, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      originalPrice,
      image,
      images,
      category,
      subcategory,
      brand,
      countInStock,
      tags,
      specifications,
      shippingInfo,
    } = req.body;

    const product = new Product({
      seller: req.user._id,
      name,
      description,
      price,
      originalPrice: originalPrice || price,
      image,
      images: images || [image],
      category,
      subcategory: subcategory || "",
      brand: brand || "",
      countInStock,
      tags: tags || [],
      specifications: specifications || {},
      shippingInfo: shippingInfo || {},
    });

    const createdProduct = await product.save();
    const populatedProduct = await Product.findById(
      createdProduct._id
    ).populate("seller", "name storeName");

    res.status(201).json(populatedProduct);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Update product (seller only - own products)
router.put("/:id", protect, checkSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user owns this product or is admin
      if (
        product.seller.toString() !== req.user._id.toString() &&
        !req.user.isAdmin
      ) {
        return res
          .status(403)
          .json({
            message: "Access denied. You can only edit your own products.",
          });
      }

      // Update fields
      product.name = req.body.name || product.name;
      product.description = req.body.description || product.description;
      product.price = req.body.price || product.price;
      product.originalPrice = req.body.originalPrice || product.originalPrice;
      product.image = req.body.image || product.image;
      product.images = req.body.images || product.images;
      product.category = req.body.category || product.category;
      product.subcategory = req.body.subcategory || product.subcategory;
      product.brand = req.body.brand || product.brand;
      product.countInStock =
        req.body.countInStock !== undefined
          ? req.body.countInStock
          : product.countInStock;
      product.tags = req.body.tags || product.tags;
      product.specifications =
        req.body.specifications || product.specifications;
      product.shippingInfo = req.body.shippingInfo || product.shippingInfo;
      product.isActive =
        req.body.isActive !== undefined ? req.body.isActive : product.isActive;

      const updatedProduct = await product.save();
      const populatedProduct = await Product.findById(
        updatedProduct._id
      ).populate("seller", "name storeName");

      res.json(populatedProduct);
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete product (seller only - own products)
router.delete("/:id", protect, checkSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user owns this product or is admin
      if (
        product.seller.toString() !== req.user._id.toString() &&
        !req.user.isAdmin
      ) {
        return res
          .status(403)
          .json({
            message: "Access denied. You can only delete your own products.",
          });
      }

      await Product.deleteOne({ _id: product._id });
      res.json({ message: "Product removed" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Toggle product active status
router.patch("/:id/toggle-status", protect, checkSeller, async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      // Check if user owns this product or is admin
      if (
        product.seller.toString() !== req.user._id.toString() &&
        !req.user.isAdmin
      ) {
        return res
          .status(403)
          .json({
            message: "Access denied. You can only modify your own products.",
          });
      }

      product.isActive = !product.isActive;
      const updatedProduct = await product.save();

      res.json({
        message: `Product ${
          updatedProduct.isActive ? "activated" : "deactivated"
        } successfully`,
        isActive: updatedProduct.isActive,
      });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add product review (buyers only)
router.post("/:id/reviews", protect, async (req, res) => {
  try {
    const { rating, comment } = req.body;
    const product = await Product.findById(req.params.id);

    if (product) {
      const alreadyReviewed = product.reviews.find(
        (r) => r.user.toString() === req.user._id.toString()
      );

      if (alreadyReviewed) {
        return res.status(400).json({ message: "Product already reviewed" });
      }

      const review = {
        name: req.user.name,
        rating: Number(rating),
        comment,
        user: req.user._id,
      };

      product.reviews.push(review);
      product.updateRating();

      await product.save();
      res.status(201).json({ message: "Review added" });
    } else {
      res.status(404).json({ message: "Product not found" });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get product categories
router.get("/categories/list", async (req, res) => {
  try {
    const categories = await Product.distinct("category", { isActive: true });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
