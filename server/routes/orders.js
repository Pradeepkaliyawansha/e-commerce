const express = require("express");
const Order = require("../models/Order");
const Product = require("../models/Product");
const { protect } = require("../middleware/auth");
const router = express.Router();

// Create new order
router.post("/", protect, async (req, res) => {
  try {
    const { orderItems, shippingAddress, paymentMethod } = req.body;

    if (orderItems && orderItems.length === 0) {
      res.status(400).json({ message: "No order items" });
      return;
    }

    // Populate seller information for each order item
    const itemsWithSellers = await Promise.all(
      orderItems.map(async (item) => {
        const product = await Product.findById(item.product).populate("seller");
        if (!product) {
          throw new Error(`Product ${item.product} not found`);
        }

        // Update stock
        if (product.countInStock < item.qty) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }

        product.countInStock -= item.qty;
        await product.save();

        return {
          ...item,
          seller: product.seller._id,
          status: "pending",
          statusHistory: [
            {
              status: "pending",
              date: new Date(),
              note: "Order placed",
            },
          ],
        };
      })
    );

    const order = new Order({
      orderItems: itemsWithSellers,
      user: req.user._id,
      shippingAddress,
      paymentMethod: paymentMethod || "PayPal",
    });

    // Calculate prices
    order.calculatePrices();

    const createdOrder = await order.save();

    // Populate the order with user and seller details
    const populatedOrder = await Order.findById(createdOrder._id)
      .populate("user", "name email")
      .populate("orderItems.seller", "name storeName email")
      .populate("orderItems.product", "name");

    res.status(201).json(populatedOrder);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get order by ID
router.get("/:id", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate("user", "name email")
      .populate("orderItems.seller", "name storeName email phone")
      .populate("orderItems.product", "name");

    if (order) {
      // Check if user can access this order (buyer, seller involved, or admin)
      const userCanAccess =
        order.user._id.toString() === req.user._id.toString() ||
        order.orderItems.some(
          (item) => item.seller._id.toString() === req.user._id.toString()
        ) ||
        req.user.isAdmin;

      if (!userCanAccess) {
        return res.status(403).json({ message: "Access denied" });
      }

      res.json(order);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's orders (buyer)
router.get("/my/orders", protect, async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("orderItems.seller", "name storeName")
      .populate("orderItems.product", "name")
      .sort({ createdAt: -1 });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get seller's orders
router.get("/seller/orders", protect, async (req, res) => {
  try {
    if (req.user.role !== "seller" && !req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Seller role required." });
    }

    const orders = await Order.find({
      "orderItems.seller": req.user._id,
    })
      .populate("user", "name email phone")
      .populate("orderItems.product", "name")
      .sort({ createdAt: -1 });

    // Filter order items to show only seller's items
    const sellerOrders = orders.map((order) => ({
      ...order.toObject(),
      orderItems: order.orderItems.filter(
        (item) => item.seller.toString() === req.user._id.toString()
      ),
    }));

    res.json(sellerOrders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order item status (seller only)
router.patch("/:orderId/items/:itemId/status", protect, async (req, res) => {
  try {
    const { status, note } = req.body;
    const { orderId, itemId } = req.params;

    if (
      ![
        "pending",
        "confirmed",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ].includes(status)
    ) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItem = order.orderItems.id(itemId);
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    // Check if user is the seller of this item or admin
    if (
      orderItem.seller.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update item status
    orderItem.status = status;
    orderItem.statusHistory.push({
      status,
      date: new Date(),
      note: note || `Status updated to ${status}`,
    });

    // Update overall order status
    order.updateOrderStatus();

    await order.save();

    const updatedOrder = await Order.findById(orderId)
      .populate("user", "name email")
      .populate("orderItems.seller", "name storeName")
      .populate("orderItems.product", "name");

    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order payment status
router.patch("/:id/pay", protect, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      // Check if user owns this order
      if (
        order.user.toString() !== req.user._id.toString() &&
        !req.user.isAdmin
      ) {
        return res.status(403).json({ message: "Access denied" });
      }

      order.isPaid = true;
      order.paidAt = Date.now();
      order.paymentResult = {
        id: req.body.id,
        status: req.body.status,
        update_time: req.body.update_time,
        email_address: req.body.payer.email_address,
      };

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update order delivery status (admin only)
router.patch("/:id/deliver", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    const order = await Order.findById(req.params.id);

    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.orderStatus = "delivered";

      // Update all order items to delivered
      order.orderItems.forEach((item) => {
        item.status = "delivered";
        item.statusHistory.push({
          status: "delivered",
          date: new Date(),
          note: "Order marked as delivered by admin",
        });
      });

      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else {
      res.status(404).json({ message: "Order not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get all orders (admin only)
router.get("/", protect, async (req, res) => {
  try {
    if (!req.user.isAdmin) {
      return res
        .status(403)
        .json({ message: "Access denied. Admin role required." });
    }

    const pageSize = Number(req.query.pageSize) || 10;
    const page = Number(req.query.pageNumber) || 1;

    const count = await Order.countDocuments({});
    const orders = await Order.find({})
      .populate("user", "id name email")
      .populate("orderItems.seller", "name storeName")
      .limit(pageSize)
      .skip(pageSize * (page - 1))
      .sort({ createdAt: -1 });

    res.json({
      orders,
      page,
      pages: Math.ceil(count / pageSize),
      total: count,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Add tracking number (seller only)
router.patch("/:orderId/items/:itemId/tracking", protect, async (req, res) => {
  try {
    const { trackingNumber } = req.body;
    const { orderId, itemId } = req.params;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ message: "Order not found" });
    }

    const orderItem = order.orderItems.id(itemId);
    if (!orderItem) {
      return res.status(404).json({ message: "Order item not found" });
    }

    // Check if user is the seller of this item
    if (
      orderItem.seller.toString() !== req.user._id.toString() &&
      !req.user.isAdmin
    ) {
      return res.status(403).json({ message: "Access denied" });
    }

    // Update tracking number and status
    order.trackingNumber = trackingNumber;
    orderItem.status = "shipped";
    orderItem.statusHistory.push({
      status: "shipped",
      date: new Date(),
      note: `Package shipped with tracking number: ${trackingNumber}`,
    });

    order.updateOrderStatus();
    await order.save();

    res.json({ message: "Tracking number added successfully", trackingNumber });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
