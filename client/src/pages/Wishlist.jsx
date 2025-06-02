import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useCart } from "../context/CartContext";
import {
  getWishlist,
  removeFromWishlist,
  addToWishlist,
} from "../services/api";

const Wishlist = () => {
  const { user } = useAuth();
  const { addToCart } = useCart();
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [removing, setRemoving] = useState({});

  useEffect(() => {
    const fetchWishlist = async () => {
      try {
        if (user && user.token) {
          const data = await getWishlist(user.token);
          setWishlistItems(data);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch wishlist");
      } finally {
        setLoading(false);
      }
    };

    fetchWishlist();
  }, [user]);

  const handleRemoveFromWishlist = async (productId) => {
    setRemoving((prev) => ({ ...prev, [productId]: true }));

    try {
      await removeFromWishlist(productId, user.token);
      setWishlistItems((prev) => prev.filter((item) => item._id !== productId));
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to remove from wishlist"
      );
    } finally {
      setRemoving((prev) => ({ ...prev, [productId]: false }));
    }
  };

  const handleAddToCart = (product) => {
    addToCart(product, 1);
  };

  const handleMoveToCart = async (product) => {
    try {
      addToCart(product, 1);
      await removeFromWishlist(product._id, user.token);
      setWishlistItems((prev) =>
        prev.filter((item) => item._id !== product._id)
      );
    } catch (error) {
      setError(error.response?.data?.message || "Failed to move item to cart");
    }
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login
          </h1>
          <p className="text-gray-600 mb-4">
            You need to be logged in to view your wishlist.
          </p>
          <Link
            to="/login"
            className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
          >
            Go to Login
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
        <p className="text-gray-600 mt-2">
          Items you've saved for later ({wishlistItems.length} items)
        </p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {wishlistItems.length === 0 ? (
        <div className="text-center py-12">
          <div className="max-w-md mx-auto">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              Your wishlist is empty
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Start adding products you love to your wishlist.
            </p>
            <div className="mt-6">
              <Link
                to="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Browse Products
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Wishlist Actions */}
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
              <div>
                <h2 className="text-lg font-medium text-gray-900">
                  {wishlistItems.length} item
                  {wishlistItems.length !== 1 ? "s" : ""} in your wishlist
                </h2>
              </div>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    wishlistItems.forEach((item) => {
                      if (item.countInStock > 0) {
                        addToCart(item, 1);
                      }
                    });
                  }}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
                >
                  Add All to Cart
                </button>
              </div>
            </div>
          </div>

          {/* Wishlist Items */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="divide-y divide-gray-200">
              {wishlistItems.map((item) => (
                <div key={item._id} className="p-6">
                  <div className="flex items-start space-x-4">
                    {/* Product Image */}
                    <div className="flex-shrink-0">
                      <Link to={`/product/${item._id}`}>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                      </Link>
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <Link to={`/product/${item._id}`}>
                            <h3 className="text-lg font-medium text-gray-900 hover:text-blue-600">
                              {item.name}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mt-1 line-clamp-2">
                            {item.description}
                          </p>
                          <div className="mt-2 flex items-center space-x-4">
                            <span className="text-xl font-bold text-blue-600">
                              ${item.price}
                            </span>
                            {item.originalPrice > item.price && (
                              <span className="text-sm text-gray-500 line-through">
                                ${item.originalPrice}
                              </span>
                            )}
                            <div className="flex items-center">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <svg
                                    key={i}
                                    className={`w-4 h-4 ${
                                      i < Math.floor(item.rating)
                                        ? "fill-current"
                                        : "fill-gray-300"
                                    }`}
                                    viewBox="0 0 24 24"
                                  >
                                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                  </svg>
                                ))}
                              </div>
                              <span className="text-sm text-gray-500 ml-1">
                                ({item.numReviews})
                              </span>
                            </div>
                          </div>
                          <div className="mt-2">
                            <span
                              className={`text-sm ${
                                item.countInStock > 0
                                  ? "text-green-600"
                                  : "text-red-600"
                              }`}
                            >
                              {item.countInStock > 0
                                ? `In Stock (${item.countInStock} available)`
                                : "Out of Stock"}
                            </span>
                          </div>
                          {item.seller && (
                            <p className="text-sm text-gray-500 mt-1">
                              Sold by:{" "}
                              {item.seller.storeName || item.seller.name}
                            </p>
                          )}
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col space-y-2 ml-4">
                          <button
                            onClick={() => handleRemoveFromWishlist(item._id)}
                            disabled={removing[item._id]}
                            className="text-red-600 hover:text-red-800 text-sm font-medium disabled:opacity-50"
                          >
                            {removing[item._id] ? "Removing..." : "Remove"}
                          </button>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="mt-4 flex space-x-3">
                        {item.countInStock > 0 ? (
                          <>
                            <button
                              onClick={() => handleMoveToCart(item)}
                              className="flex-1 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors text-sm font-medium"
                            >
                              Move to Cart
                            </button>
                            <button
                              onClick={() => handleAddToCart(item)}
                              className="flex-1 border border-blue-500 text-blue-500 px-4 py-2 rounded hover:bg-blue-50 transition-colors text-sm font-medium"
                            >
                              Add to Cart
                            </button>
                          </>
                        ) : (
                          <button
                            disabled
                            className="flex-1 bg-gray-300 text-gray-500 px-4 py-2 rounded cursor-not-allowed text-sm font-medium"
                          >
                            Out of Stock
                          </button>
                        )}
                        <Link
                          to={`/product/${item._id}`}
                          className="flex-1 border border-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-50 transition-colors text-sm font-medium text-center"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Continue Shopping */}
          <div className="text-center">
            <Link
              to="/products"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
            >
              <svg
                className="w-5 h-5 mr-2"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16l-4-4m0 0l4-4m-4 4h18"
                />
              </svg>
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wishlist;
