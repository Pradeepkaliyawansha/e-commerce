import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { createProduct } from "../services/api";

const AddProduct = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    originalPrice: "",
    image: "",
    category: "",
    subcategory: "",
    brand: "",
    countInStock: "",
    tags: "",
    specifications: "",
    shippingInfo: {
      weight: "",
      freeShipping: false,
      shippingCost: "",
    },
  });

  const categories = [
    "Electronics",
    "Clothing & Fashion",
    "Home & Garden",
    "Sports & Outdoors",
    "Books & Media",
    "Health & Beauty",
    "Toys & Games",
    "Automotive",
    "Food & Beverages",
    "Jewelry & Accessories",
    "Art & Crafts",
    "Pet Supplies",
    "Office Supplies",
    "Musical Instruments",
    "Other",
  ];

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name.includes("shippingInfo.")) {
      const field = name.split(".")[1];
      setFormData({
        ...formData,
        shippingInfo: {
          ...formData.shippingInfo,
          [field]: type === "checkbox" ? checked : value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: type === "checkbox" ? checked : value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Process tags and specifications
      const tags = formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag);

      let specifications = {};
      if (formData.specifications) {
        try {
          // Try to parse as JSON first
          specifications = JSON.parse(formData.specifications);
        } catch {
          // If not JSON, treat as key-value pairs separated by commas
          const specs = formData.specifications.split(",");
          specs.forEach((spec) => {
            const [key, value] = spec.split(":").map((s) => s.trim());
            if (key && value) {
              specifications[key] = value;
            }
          });
        }
      }

      const productData = {
        ...formData,
        price: parseFloat(formData.price),
        originalPrice: formData.originalPrice
          ? parseFloat(formData.originalPrice)
          : parseFloat(formData.price),
        countInStock: parseInt(formData.countInStock),
        tags,
        specifications,
        shippingInfo: {
          ...formData.shippingInfo,
          weight: formData.shippingInfo.weight
            ? parseFloat(formData.shippingInfo.weight)
            : 0,
          shippingCost: formData.shippingInfo.shippingCost
            ? parseFloat(formData.shippingInfo.shippingCost)
            : 0,
        },
      };

      await createProduct(productData, user.token);
      navigate("/seller/dashboard");
    } catch (error) {
      setError(error.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== "seller") {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Access Denied
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              You need to be a registered seller to add products.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Add New Product
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Create a new product listing for your store
          </p>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg dark:shadow-xl border dark:border-gray-700 transition-colors duration-200">
          <form onSubmit={handleSubmit} className="p-6 space-y-8">
            {error && (
              <div className="bg-red-100 dark:bg-red-900/50 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-400 px-4 py-3 rounded-lg flex items-center">
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
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                {error}
              </div>
            )}

            {/* Basic Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-blue-500 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  Basic Information
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Essential product details that customers will see first
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Product Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    required
                    value={formData.name}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Brand
                  </label>
                  <input
                    type="text"
                    name="brand"
                    value={formData.brand}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter brand name"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  placeholder="Describe your product in detail"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Product Image URL *
                </label>
                <input
                  type="url"
                  name="image"
                  required
                  value={formData.image}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="https://example.com/image.jpg"
                />
                {formData.image && (
                  <div className="mt-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Preview:
                    </p>
                    <img
                      src={formData.image}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg border border-gray-300 dark:border-gray-600"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Category & Pricing */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-green-500 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"
                    />
                  </svg>
                  Category & Pricing
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Categorize your product and set competitive pricing
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    required
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Subcategory
                  </label>
                  <input
                    type="text"
                    name="subcategory"
                    value={formData.subcategory}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="Enter subcategory"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      name="price"
                      required
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Original Price
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      name="originalPrice"
                      min="0"
                      step="0.01"
                      value={formData.originalPrice}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    For showing discounts
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    name="countInStock"
                    required
                    min="0"
                    value={formData.countInStock}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="0"
                  />
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-purple-500 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  Additional Information
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Enhance your product listing with detailed specifications
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={formData.tags}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                  placeholder="wireless, bluetooth, premium, gift"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Separate tags with commas to help customers find your product
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Specifications
                </label>
                <textarea
                  name="specifications"
                  rows={4}
                  value={formData.specifications}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200 resize-none"
                  placeholder='{"Color": "Blue", "Size": "Large", "Material": "Cotton"} or Color: Blue, Size: Large, Material: Cotton'
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  JSON format or key:value pairs separated by commas
                </p>
              </div>
            </div>

            {/* Shipping Information */}
            <div className="space-y-6">
              <div className="border-b border-gray-200 dark:border-gray-600 pb-4">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                  <svg
                    className="w-6 h-6 mr-2 text-orange-500 dark:text-orange-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                    />
                  </svg>
                  Shipping Information
                </h2>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  Configure shipping options for your product
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    name="shippingInfo.weight"
                    min="0"
                    step="0.1"
                    value={formData.shippingInfo.weight}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                    placeholder="0.0"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Shipping Cost
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 dark:text-gray-400">
                      $
                    </span>
                    <input
                      type="number"
                      name="shippingInfo.shippingCost"
                      min="0"
                      step="0.01"
                      value={formData.shippingInfo.shippingCost}
                      onChange={handleInputChange}
                      className="w-full pl-8 pr-4 py-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200"
                      placeholder="0.00"
                      disabled={formData.shippingInfo.freeShipping}
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="shippingInfo.freeShipping"
                  checked={formData.shippingInfo.freeShipping}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 bg-gray-100 dark:bg-gray-700 border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500 dark:focus:ring-blue-600 focus:ring-2"
                />
                <label className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300">
                  Free Shipping
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex flex-col sm:flex-row justify-end space-y-3 sm:space-y-0 sm:space-x-4 pt-8 border-t border-gray-200 dark:border-gray-600">
              <button
                type="button"
                onClick={() => navigate("/seller/dashboard")}
                className="w-full sm:w-auto px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 font-medium transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto px-6 py-3 bg-blue-500 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-600 dark:hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 flex items-center justify-center"
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Creating Product...
                  </div>
                ) : (
                  <div className="flex items-center">
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
                        d="M12 4v16m8-8H4"
                      />
                    </svg>
                    Create Product
                  </div>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded-lg p-6 transition-colors duration-200">
          <div className="flex">
            <svg
              className="w-6 h-6 text-blue-500 dark:text-blue-400 mt-0.5 mr-3 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div>
              <h3 className="text-lg font-medium text-blue-800 dark:text-blue-200 mb-2">
                Tips for Better Product Listings
              </h3>
              <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
                <li>• Use high-quality, well-lit product images</li>
                <li>• Write detailed, honest descriptions</li>
                <li>• Choose relevant categories and tags</li>
                <li>• Set competitive but fair pricing</li>
                <li>• Keep your inventory count accurate</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddProduct;
