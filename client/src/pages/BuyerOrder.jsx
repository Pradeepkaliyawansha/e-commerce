import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getUserOrders } from "../services/api";

const BuyerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user && user.token) {
          const data = await getUserOrders(user.token);
          setOrders(data);
        }
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch orders");
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, [user]);

  const getStatusColor = (status) => {
    const colors = {
      pending: "bg-yellow-100 text-yellow-800",
      confirmed: "bg-blue-100 text-blue-800",
      processing: "bg-purple-100 text-purple-800",
      shipped: "bg-indigo-100 text-indigo-800",
      delivered: "bg-green-100 text-green-800",
      cancelled: "bg-red-100 text-red-800",
    };
    return colors[status] || "bg-gray-100 text-gray-800";
  };

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Please Login
          </h1>
          <p className="text-gray-600">
            You need to be logged in to view your orders.
          </p>
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
        <h1 className="text-3xl font-bold text-gray-900">My Orders</h1>
        <p className="text-gray-600 mt-2">Track and manage your orders</p>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {orders.length === 0 ? (
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
                d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              No orders yet
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              You haven't placed any orders yet. Start shopping to see your
              orders here.
            </p>
            <div className="mt-6">
              <a
                href="/products"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
              >
                Start Shopping
              </a>
            </div>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order._id}
              className="bg-white shadow rounded-lg overflow-hidden"
            >
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Order #{order.orderNumber}
                    </h3>
                    <p className="text-sm text-gray-500">
                      Placed on {new Date(order.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      ${order.totalPrice?.toFixed(2)}
                    </div>
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        order.orderStatus
                      )}`}
                    >
                      {order.orderStatus?.charAt(0).toUpperCase() +
                        order.orderStatus?.slice(1)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="px-6 py-4">
                <div className="space-y-4">
                  {order.orderItems?.map((item, index) => (
                    <div key={index} className="flex items-center space-x-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg"
                      />
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {item.name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          Qty: {item.qty} × ${item.price}
                        </p>
                        {item.seller && (
                          <p className="text-sm text-gray-500">
                            Sold by: {item.seller.storeName || item.seller.name}
                          </p>
                        )}
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                            item.status
                          )}`}
                        >
                          {item.status?.charAt(0).toUpperCase() +
                            item.status?.slice(1)}
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-gray-900">
                          ${(item.price * item.qty).toFixed(2)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        Shipping Address
                      </h4>
                      <p className="text-sm text-gray-500">
                        {order.shippingAddress?.address},{" "}
                        {order.shippingAddress?.city},{" "}
                        {order.shippingAddress?.postalCode},{" "}
                        {order.shippingAddress?.country}
                      </p>
                    </div>
                    <div className="text-right">
                      {order.trackingNumber && (
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            Tracking Number
                          </p>
                          <p className="text-sm text-blue-600">
                            {order.trackingNumber}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {order.isPaid && (
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center text-green-600">
                      <svg
                        className="w-5 h-5 mr-2"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        Payment confirmed on{" "}
                        {new Date(order.paidAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default BuyerOrders;
