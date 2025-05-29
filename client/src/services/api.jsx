import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_URL,
});

// Auth API
export const loginUser = async (email, password) => {
  const response = await api.post("/auth/login", { email, password });
  return response.data;
};

export const registerUser = async (name, email, password, role = "buyer") => {
  const response = await api.post("/auth/register", {
    name,
    email,
    password,
    role,
  });
  return response.data;
};

export const registerBuyer = async (name, email, password) => {
  const response = await api.post("/auth/register/buyer", {
    name,
    email,
    password,
  });
  return response.data;
};

export const registerSeller = async (
  name,
  email,
  password,
  storeName,
  storeDescription,
  phone
) => {
  const response = await api.post("/auth/register/seller", {
    name,
    email,
    password,
    storeName,
    storeDescription,
    phone,
  });
  return response.data;
};

export const getUserProfile = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get("/auth/profile", config);
  return response.data;
};

export const updateUserProfile = async (userData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.put("/auth/profile", userData, config);
  return response.data;
};

// Products API
export const getProducts = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(
    `/products${queryString ? "?" + queryString : ""}`
  );
  return response.data;
};

export const getProduct = async (id) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const getFeaturedProducts = async () => {
  const response = await api.get("/products/featured");
  return response.data;
};

export const getProductsByCategory = async (category) => {
  const response = await api.get(`/products?category=${category}`);
  return response.data;
};

export const getProductCategories = async () => {
  const response = await api.get("/products/categories/list");
  return response.data;
};

export const searchProducts = async (keyword, filters = {}) => {
  const params = { keyword, ...filters };
  const queryString = new URLSearchParams(params).toString();
  const response = await api.get(`/products?${queryString}`);
  return response.data;
};

// Seller Products API
export const getSellerProducts = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get("/products/my-products", config);
  return response.data;
};

export const getProductsBySeller = async (sellerId) => {
  const response = await api.get(`/products/seller/${sellerId}`);
  return response.data;
};

export const createProduct = async (productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.post("/products", productData, config);
  return response.data;
};

export const updateProduct = async (id, productData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.put(`/products/${id}`, productData, config);
  return response.data;
};

export const deleteProduct = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.delete(`/products/${id}`, config);
  return response.data;
};

export const toggleProductStatus = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.patch(`/products/${id}/toggle-status`, {}, config);
  return response.data;
};

// Product Reviews API
export const addProductReview = async (id, reviewData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.post(
    `/products/${id}/reviews`,
    reviewData,
    config
  );
  return response.data;
};

// Orders API
export const createOrder = async (orderData, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.post("/orders", orderData, config);
  return response.data;
};

export const getOrder = async (id, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get(`/orders/${id}`, config);
  return response.data;
};

export const getUserOrders = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get("/orders/my-orders", config);
  return response.data;
};

export const getSellerOrders = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get("/orders/seller-orders", config);
  return response.data;
};

export const updateOrderStatus = async (id, status, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.patch(`/orders/${id}/status`, { status }, config);
  return response.data;
};

// Statistics API for sellers
export const getSellerStats = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get("/seller/stats", config);
  return response.data;
};

// Wishlist API
export const getWishlist = async (token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.get("/wishlist", config);
  return response.data;
};

export const addToWishlist = async (productId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.post("/wishlist", { productId }, config);
  return response.data;
};

export const removeFromWishlist = async (productId, token) => {
  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
  const response = await api.delete(`/wishlist/${productId}`, config);
  return response.data;
};

export default api;
