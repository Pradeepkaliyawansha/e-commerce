import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import { useCart } from "../context/CartContext";

const Cart = ({ onClose }) => {
  const { cartItems, removeFromCart, addToCart } = useCart();

  // Prevent body scroll when cart is open
  useEffect(() => {
    const originalStyle = window.getComputedStyle(document.body).overflow;
    const originalScrollY = window.scrollY;

    // Prevent background scroll
    document.body.style.overflow = "hidden";
    document.body.style.position = "fixed";
    document.body.style.top = `-${originalScrollY}px`;
    document.body.style.width = "100%";

    return () => {
      // Restore scroll
      document.body.style.overflow = originalStyle;
      document.body.style.position = "";
      document.body.style.top = "";
      document.body.style.width = "";
      window.scrollTo(0, originalScrollY);
    };
  }, []);

  const getTotalPrice = () => {
    return cartItems
      .reduce((acc, item) => acc + item.price * item.qty, 0)
      .toFixed(2);
  };

  const updateQuantity = (item, newQty) => {
    if (newQty === 0) {
      removeFromCart(item._id);
    } else {
      addToCart(item, newQty);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 z-50 flex justify-end transition-all duration-300">
      <div className="bg-white dark:bg-gray-800 w-full max-w-md h-full overflow-y-auto transition-colors duration-200 shadow-2xl cart-sidebar">
        {/* Header */}
        <div className="p-4 border-b border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 sticky top-0 z-10 sticky-fix">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Shopping Cart
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors duration-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              aria-label="Close cart"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
          {/* Cart Items Count */}
          {cartItems.length > 0 && (
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {cartItems.length} {cartItems.length === 1 ? "item" : "items"} in
              cart
            </p>
          )}
        </div>

        <div className="p-4 pb-20">
          {" "}
          {/* Added bottom padding for better scroll */}
          {cartItems.length === 0 ? (
            /* Empty Cart State */
            <div className="text-center py-12">
              <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
                <svg
                  className="w-12 h-12 text-gray-400 dark:text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-2.5 5M7 13l2.5 5m6-5v6a2 2 0 11-4 0v-6m-6 4h14"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Your cart is empty
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Add some products to get started
              </p>
              <Link
                to="/products"
                onClick={onClose}
                className="inline-flex items-center px-4 py-2 bg-blue-500 dark:bg-blue-600 text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
                  />
                </svg>
                Continue Shopping
              </Link>
            </div>
          ) : (
            <>
              {/* Cart Items */}
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div
                    key={item._id}
                    className="flex items-center justify-between py-4 px-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600 hover:shadow-md dark:hover:shadow-lg transition-all duration-200"
                  >
                    <div className="flex items-center flex-1">
                      <div className="relative">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-md border dark:border-gray-600"
                          loading="lazy"
                        />
                        {/* Remove button overlay */}
                        <button
                          onClick={() => removeFromCart(item._id)}
                          className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs transition-colors duration-200 shadow-lg"
                          title="Remove item"
                          aria-label={`Remove ${item.name} from cart`}
                        >
                          ×
                        </button>
                      </div>
                      <div className="ml-4 flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                          {item.name}
                        </h3>
                        <p className="text-blue-600 dark:text-blue-400 font-bold text-lg">
                          ${item.price}
                        </p>
                        {/* Quantity Controls */}
                        <div className="flex items-center mt-2">
                          <button
                            onClick={() => updateQuantity(item, item.qty - 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-l-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 border border-r-0 border-gray-300 dark:border-gray-500"
                            disabled={item.qty <= 1}
                            aria-label="Decrease quantity"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M20 12H4"
                              />
                            </svg>
                          </button>
                          <span className="w-12 h-8 flex items-center justify-center bg-white dark:bg-gray-800 border-t border-b border-gray-300 dark:border-gray-500 text-gray-900 dark:text-white font-medium text-sm">
                            {item.qty}
                          </span>
                          <button
                            onClick={() => updateQuantity(item, item.qty + 1)}
                            className="w-8 h-8 flex items-center justify-center bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-r-md hover:bg-gray-300 dark:hover:bg-gray-500 transition-colors duration-200 border border-l-0 border-gray-300 dark:border-gray-500"
                            aria-label="Increase quantity"
                          >
                            <svg
                              className="w-3 h-3"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 6v12m6-6H6"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div className="text-right ml-4">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          ${(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Cart Summary - Fixed at bottom */}
              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-600 sticky bottom-0 bg-white dark:bg-gray-800 pb-4">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  {/* Subtotal */}
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Subtotal (
                      {cartItems.reduce((acc, item) => acc + item.qty, 0)}{" "}
                      items)
                    </span>
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      ${getTotalPrice()}
                    </span>
                  </div>

                  {/* Shipping */}
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      Shipping
                    </span>
                    <span className="text-sm text-green-600 dark:text-green-400 font-medium">
                      Free
                    </span>
                  </div>

                  {/* Total */}
                  <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-600">
                    <span className="text-lg font-semibold text-gray-900 dark:text-white">
                      Total
                    </span>
                    <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                      ${getTotalPrice()}
                    </span>
                  </div>
                </div>

                {/* Checkout Button */}
                <Link
                  to="/checkout"
                  onClick={onClose}
                  className="w-full mt-4 bg-blue-500 dark:bg-blue-600 text-white py-3 px-4 rounded-lg text-center block hover:bg-blue-600 dark:hover:bg-blue-700 transition-colors duration-200 font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] active:scale-[0.98]"
                >
                  <div className="flex items-center justify-center">
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
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    Proceed to Checkout
                  </div>
                </Link>

                {/* Continue Shopping */}
                <Link
                  to="/products"
                  onClick={onClose}
                  className="w-full mt-2 bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 rounded-lg text-center block hover:bg-gray-200 dark:hover:bg-gray-500 transition-colors duration-200 font-medium"
                >
                  Continue Shopping
                </Link>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Cart;
