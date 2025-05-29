import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { getSellerOrders, updateOrderStatus } from "../services/api";

const SellerOrders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState({});

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        if (user && user.token && user.role === "seller") {
          const data = await getSellerOrders(user.token);
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

  const handleStatusUpdate = async (orderId, itemId, newStatus) => {
    const updateKey = `${orderId}-${itemId}`;
    setUpdating((prev) => ({ ...prev, [updateKey]: true }));

    try {
      await updateOrderStatus(orderId, itemId, newStatus, user.token);

      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) => {
          if (order._id === orderId) {
            return {
              ...order,
              orderItems: order.orderItems.map((item) => {
                if (item._id === itemId) {
                  return { ...item, status: newStatus };
                }
                return item;
              }),
            };
          }
          return order;
        })
      );
    } catch (error) {
      setError(
        error.response?.data?.message || "Failed to update order status"
      );
    } finally {
      setUpdating((prev) => ({ ...prev, [updateKey]: false }));
    }
  };

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

  const getAvailableStatuses = (currentStatus) => {
    const statusFlow = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
      delivered: [],
      cancelled: [],
    };
    return statusFlow[currentStatus] || [];
  };

  if (!user || user.role !== "seller") {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Access Denied
          </h1>
          <p className="text-gray-600">
            You need to be a registered seller to access this page.
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
        <h1 className="text-3xl font-bold text-gray-900">Orders Management</h1>
        <p className="text-gray-600 mt-2">
          Manage and track your product orders
        </p>
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
              You haven't received any orders yet. Keep promoting your products!
            </p>
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
                    <p className="text-sm text-gray-600">
                      Customer: {order.user?.name} ({order.user?.email})
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-gray-900">
                      $
                      {order.orderItems
                        ?.reduce((sum, item) => sum + item.price * item.qty, 0)
                        .toFixed(2)}
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
                <div className="space-y-6">
                  {order.orderItems?.map((item, index) => (
                    <div
                      key={index}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h4 className="text-lg font-medium text-gray-900">
                            {item.name}
                          </h4>
                          <div className="mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                              <p className="text-sm text-gray-500">Quantity</p>
                              <p className="text-sm font-medium">{item.qty}</p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Price</p>
                              <p className="text-sm font-medium">
                                ${item.price}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-gray-500">Total</p>
                              <p className="text-sm font-medium">
                                ${(item.price * item.qty).toFixed(2)}
                              </p>
                            </div>
                          </div>

                          <div className="mt-4">
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-sm text-gray-500">
                                  Current Status
                                </p>
                                <span
                                  className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${getStatusColor(
                                    item.status
                                  )}`}
                                >
                                  {item.status?.charAt(0).toUpperCase() +
                                    item.status?.slice(1)}
                                </span>
                              </div>

                              {getAvailableStatuses(item.status).length > 0 && (
                                <div>
                                  <p className="text-sm text-gray-500 mb-2">
                                    Update Status
                                  </p>
                                  <div className="flex space-x-2">
                                    {getAvailableStatuses(item.status).map(
                                      (status) => (
                                        <button
                                          key={status}
                                          onClick={() =>
                                            handleStatusUpdate(
                                              order._id,
                                              item._id,
                                              status
                                            )
                                          }
                                          disabled={
                                            updating[`${order._id}-${item._id}`]
                                          }
                                          className={`px-3 py-1 text-xs font-medium rounded-full border ${
                                            status === "cancelled"
                                              ? "border-red-300 text-red-700 hover:bg-red-50"
                                              : "border-blue-300 text-blue-700 hover:bg-blue-50"
                                          } ${
                                            updating[`${order._id}-${item._id}`]
                                              ? "opacity-50 cursor-not-allowed"
                                              : "hover:shadow-sm"
                                          }`}
                                        >
                                          {updating[`${order._id}-${item._id}`]
                                            ? "Updating..."
                                            : status.charAt(0).toUpperCase() +
                                              status.slice(1)}
                                        </button>
                                      )
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          {item.statusHistory &&
                            item.statusHistory.length > 0 && (
                              <div className="mt-4 pt-4 border-t border-gray-100">
                                <p className="text-sm font-medium text-gray-900 mb-2">
                                  Status History
                                </p>
                                <div className="space-y-1">
                                  {item.statusHistory
                                    .slice(-3)
                                    .map((history, historyIndex) => (
                                      <div
                                        key={historyIndex}
                                        className="text-sm text-gray-600"
                                      >
                                        <span className="font-medium">
                                          {history.status
                                            .charAt(0)
                                            .toUpperCase() +
                                            history.status.slice(1)}
                                        </span>
                                        {" - "}
                                        <span>
                                          {new Date(
                                            history.date
                                          ).toLocaleString()}
                                        </span>
                                        {history.note && (
                                          <span className="text-gray-500">
                                            {" "}
                                            ({history.note})
                                          </span>
                                        )}
                                      </div>
                                    ))}
                                </div>
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Shipping Address
                  </h4>
                  <p className="text-sm text-gray-600">
                    {order.shippingAddress?.address}
                    <br />
                    {order.shippingAddress?.city},{" "}
                    {order.shippingAddress?.postalCode}
                    <br />
                    {order.shippingAddress?.country}
                  </p>
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
                        Payment received on{" "}
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

export default SellerOrders;
