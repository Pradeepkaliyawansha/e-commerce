const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  qty: { type: Number, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "Product",
  },
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
  status: {
    type: String,
    enum: [
      "pending",
      "confirmed",
      "processing",
      "shipped",
      "delivered",
      "cancelled",
    ],
    default: "pending",
  },
  statusHistory: [
    {
      status: String,
      date: { type: Date, default: Date.now },
      note: String,
    },
  ],
});

const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    orderItems: [orderItemSchema],
    shippingAddress: {
      address: { type: String, required: true },
      city: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true },
    },
    paymentMethod: {
      type: String,
      default: "PayPal",
    },
    paymentResult: {
      id: String,
      status: String,
      update_time: String,
      email_address: String,
    },
    itemsPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    taxPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    shippingPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    totalPrice: {
      type: Number,
      required: true,
      default: 0.0,
    },
    isPaid: {
      type: Boolean,
      required: true,
      default: false,
    },
    paidAt: {
      type: Date,
    },
    isDelivered: {
      type: Boolean,
      required: true,
      default: false,
    },
    deliveredAt: {
      type: Date,
    },
    orderStatus: {
      type: String,
      enum: ["pending", "processing", "shipped", "delivered", "cancelled"],
      default: "pending",
    },
    orderNumber: {
      type: String,
      unique: true,
    },
    notes: {
      type: String,
      default: "",
    },
    trackingNumber: {
      type: String,
      default: "",
    },
    estimatedDelivery: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number before saving
orderSchema.pre("save", function (next) {
  if (!this.orderNumber && this.isNew) {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000)
      .toString()
      .padStart(3, "0");
    this.orderNumber = `ORD-${timestamp.slice(-6)}${random}`;
  }
  next();
});

// Update overall order status based on item statuses
orderSchema.methods.updateOrderStatus = function () {
  if (this.orderItems.length === 0) return;

  const statuses = this.orderItems.map((item) => item.status);

  if (statuses.every((status) => status === "delivered")) {
    this.orderStatus = "delivered";
    this.isDelivered = true;
    this.deliveredAt = new Date();
  } else if (
    statuses.some((status) => status === "cancelled") &&
    statuses.every((status) => ["cancelled", "delivered"].includes(status))
  ) {
    this.orderStatus = "cancelled";
  } else if (statuses.some((status) => status === "shipped")) {
    this.orderStatus = "shipped";
  } else if (statuses.some((status) => status === "processing")) {
    this.orderStatus = "processing";
  } else {
    this.orderStatus = "pending";
  }
};

// Calculate prices
orderSchema.methods.calculatePrices = function () {
  this.itemsPrice = this.orderItems.reduce(
    (acc, item) => acc + item.price * item.qty,
    0
  );
  this.taxPrice = this.itemsPrice * 0.1; // 10% tax
  this.shippingPrice = this.itemsPrice > 100 ? 0 : 10; // Free shipping over $100
  this.totalPrice = this.itemsPrice + this.taxPrice + this.shippingPrice;
};

module.exports = mongoose.model("Order", orderSchema);
