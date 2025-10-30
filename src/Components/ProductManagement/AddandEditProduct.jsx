// src/components/AddEditProduct.jsx
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useParams, useNavigate, Link } from "react-router-dom";
import { toast } from "react-toastify";
import BaseURL from "../BaseURL/BaseURL";
import { X } from "lucide-react";
import { VendorContext } from "../VendorContext/VendorContext";
import { useCategories } from "../CategoryContext/CategoryContext";
import { useTranslation } from "react-i18next";
import { authenticatedFetch } from "../../utils/apiUtils";

const AddEditProduct = () => {
  const { t } = useTranslation();
  const { categories } = useCategories(); // Use shared categories
  const vendorId = localStorage.getItem("vendorId");
  const { productId } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!productId;

  // Track user location (for geolocation)
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
  });

  // Product form data
  const [formData, setFormData] = useState({
    name_en: "",
    name_ar: "",
    description: "",
    category: "",
    price: "",
    discountPrice: "",
    stockQuantity: "",
    lowStockAlert: "",
    images: [],
    isActive: true,
    language: "",
    measurementUnit: "",
  });

  // Track existing images from server and new uploaded images separately
  const [existingImages, setExistingImages] = useState([]);
  const [newImages, setNewImages] = useState([]);
  const [imagesToRemove, setImagesToRemove] = useState([]);
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);


  // ----------------------------------------------------------------------------
  // Fetch product data (Edit mode)
  // ----------------------------------------------------------------------------
  useEffect(() => {
    if (isEditMode) {
      const fetchProduct = async () => {
        try {
          const response = await axios.get(
            `${BaseURL}/getProductById/${productId}`
          );
          const product = response.data.product;

          // Find the category in the categories list
          const selectedCategory = categories.find(
            (category) => category._id === product.category
          );

          // Store existing images separately
          setExistingImages(product.images || []);

          setFormData({
            name_en: product.name_en || "",
            name_ar: product.name_ar || "",
            description: product.description || "",
            category: selectedCategory ? selectedCategory._id : "",
            price: product.price || "",
            discountPrice: product.discountPrice || "",
            stockQuantity: product.stockQuantity || "",
            lowStockAlert: product.lowStockAlert || "",
            isActive: product.isActive,
            language: product.language || "",
            measurementUnit: product.measurementUnit || "",
          });
        } catch (error) {
          console.error("Error fetching product:", error);
          toast.error(t("failed_to_fetch_product"));
        }
      };

      fetchProduct();
    }
  }, [isEditMode, productId, categories, t]);

  // ----------------------------------------------------------------------------
  // Validate form
  // ----------------------------------------------------------------------------
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name_en) newErrors.name_en = t("product_name_en_required");
    if (!formData.name_ar) newErrors.name_ar = t("product_name_ar_required");
    if (!formData.price || isNaN(formData.price)) {
      newErrors.price = t("valid_price_required");
    }
    if (!formData.stockQuantity || isNaN(formData.stockQuantity)) {
      newErrors.stockQuantity = t("valid_stock_quantity_required");
    }
    if (!formData.category) newErrors.category = t("category_required");
    if (!formData.language) newErrors.language = t("language_required");
    if (!formData.measurementUnit)
      newErrors.measurementUnit = t("measurement_unit_required");

    // Validate discount price
    if (formData.discountPrice && formData.price) {
      const originalPrice = parseFloat(formData.price);
      const discountPrice = parseFloat(formData.discountPrice);
      if (discountPrice > originalPrice) {
        newErrors.discountPrice = t("discount_price_validation");
      }
    }

    setErrors(newErrors);

    // If there's a discount price error, show a toast
    if (newErrors.discountPrice) {
      toast.error(newErrors.discountPrice);
    }

    return Object.keys(newErrors).length === 0;
  };

  // ----------------------------------------------------------------------------
  // Handle image upload
  // ----------------------------------------------------------------------------
  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const uploadedImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    
    setNewImages((prev) => [...prev, ...uploadedImages]);
  };

  // ----------------------------------------------------------------------------
  // Remove image from preview
  // ----------------------------------------------------------------------------
  const removeExistingImage = (index) => {
    const removedImage = existingImages[index];
    setExistingImages((prev) => {
      const newImages = [...prev];
      newImages.splice(index, 1);
      return newImages;
    });
    
    // Extract filename from URL
    const urlParts = removedImage.split('/');
    const filenameWithExt = urlParts[urlParts.length - 1];
    const filename = filenameWithExt.substring(0, filenameWithExt.lastIndexOf('.'));
    
    setImagesToRemove((prev) => [...prev, filename]);
  };

  const removeNewImage = (index) => {
    setNewImages((prev) => {
      const images = [...prev];
      images.splice(index, 1);
      return images;
    });
  };

  // ----------------------------------------------------------------------------
  // Handle form submit
  // ----------------------------------------------------------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);

    // Attempt geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          // Once location is retrieved, save product data
          saveProductData(position.coords.latitude, position.coords.longitude);
        },
        (error) => {
          console.error("Error getting location", error);
          toast.error(t("location_error"));
          // Fallback if location not available
          saveProductData(null, null);
        }
      );
    } else {
      console.warn("Geolocation not supported by this browser.");
      toast.error(t("location_error"));
      saveProductData(null, null);
    }
  };

  // ----------------------------------------------------------------------------
  // Save product data to server
  // ----------------------------------------------------------------------------
  const saveProductData = async (latitude, longitude) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("vendorId", vendorId);
      formDataToSend.append("name_en", formData.name_en);
      formDataToSend.append("name_ar", formData.name_ar);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("category", formData.category);
      formDataToSend.append("price", parseFloat(formData.price));
      if (formData.discountPrice) {
        formDataToSend.append(
          "discountPrice",
          parseFloat(formData.discountPrice)
        );
      }
      formDataToSend.append(
        "stockQuantity",
        parseInt(formData.stockQuantity, 10)
      );
      if (formData.lowStockAlert) {
        formDataToSend.append(
          "lowStockAlert",
          parseInt(formData.lowStockAlert, 10)
        );
      }
      formDataToSend.append("isActive", formData.isActive);
      formDataToSend.append("language", formData.language);
      formDataToSend.append("measurementUnit", formData.measurementUnit);

      // Append geolocation if available
      if (latitude && longitude) {
        formDataToSend.append("latitude", latitude);
        formDataToSend.append("longitude", longitude);
      }

      // Append new images
      newImages.forEach((image) => {
        if (image.file) {
          formDataToSend.append("images", image.file);
        }
      });

      // If editing, process removed images
      if (isEditMode && imagesToRemove.length > 0) {
        imagesToRemove.forEach((filename) => {
          formDataToSend.append("removeImages[]", filename);
        });
      }

      if (isEditMode) {
        const response = await authenticatedFetch(`/updateProduct/${productId}`, {
          method: 'PUT',
          body: formDataToSend,
        });
        if (response) {
          toast.success(t("product_updated_successfully"));
        }
      } else {
        const response = await authenticatedFetch('/createProduct', {
          method: 'POST',
          body: formDataToSend,
        });
        if (response) {
          toast.success(t("product_added_successfully"));
        }
      }

      navigate("/");
    } catch (error) {
      console.error("Error saving product:", error);
      toast.error(t("failed_to_save_product"));
    } finally {
      setIsLoading(false);
    }
  };

  // ----------------------------------------------------------------------------
  // Render
  // ----------------------------------------------------------------------------
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {isEditMode ? t("edit_product") : t("add_product")}
        </h1>
        <nav className="text-sm text-gray-500 mt-2">
          <Link to="/">{t("home")}</Link> &gt;{" "}
          <Link to="/">{t("products")}</Link> &gt;{" "}
          {isEditMode ? t("edit_product") : t("add_product")}
        </nav>
      </div>

      {/* Form Section */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Details */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("basic_details")}</h2>
          <div className="space-y-4">
            {/* Product Name (English) */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="name_en"
              >
                {t("product_name_en")}
              </label>
              <input
                type="text"
                id="name_en"
                value={formData.name_en}
                onChange={(e) =>
                  setFormData({ ...formData, name_en: e.target.value })
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.name_en ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name_en && (
                <p className="text-red-500 text-sm mt-1">{errors.name_en}</p>
              )}
            </div>

            {/* Product Name (Arabic) */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="name_ar"
              >
                {t("product_name_ar")}
              </label>
              <input
                type="text"
                id="name_ar"
                value={formData.name_ar}
                onChange={(e) =>
                  setFormData({ ...formData, name_ar: e.target.value })
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.name_ar ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.name_ar && (
                <p className="text-red-500 text-sm mt-1">{errors.name_ar}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="description"
              >
                {t("description")}
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                rows="5"
              ></textarea>
            </div>

            {/* Category */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="category"
              >
                {t("category")}
              </label>
              <select
                id="category"
                value={formData.category}
                onChange={(e) =>
                  setFormData({ ...formData, category: e.target.value })
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.category ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">{t("select_category")}</option>
                {categories.map((category) => (
                  <option key={category._id} value={category._id}>
                    {category.name.en}
                  </option>
                ))}
              </select>
              {errors.category && (
                <p className="text-red-500 text-sm mt-1">{errors.category}</p>
              )}
            </div>

            {/* Language */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="language"
              >
                {t("language")}
              </label>
              <select
                id="language"
                value={formData.language}
                onChange={(e) =>
                  setFormData({ ...formData, language: e.target.value })
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.language ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">{t("select_language")}</option>
                <option value="en">{t("english")}</option>
                <option value="ar">{t("arabic")}</option>
                <option value="fr">{t("french")}</option>
                <option value="hi">{t("hindi")}</option>
              </select>
              {errors.language && (
                <p className="text-red-500 text-sm mt-1">{errors.language}</p>
              )}
            </div>

            {/* Measurement Unit */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="measurementUnit"
              >
                {t("measurement_unit")} {/* Measurement Unit label */}
              </label>
              <select
                id="measurementUnit"
                value={formData.measurementUnit}
                onChange={(e) =>
                  setFormData({ ...formData, measurementUnit: e.target.value })
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.measurementUnit ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">{t("select_measurement_unit")}</option>
                <option value="meter">{t("meter")}</option>
                <option value="kilogram">{t("kilogram")}</option>
                <option value="piece">{t("piece")}</option>
              </select>
              {errors.measurementUnit && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.measurementUnit}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Pricing */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("pricing")}</h2>
          <div className="space-y-4">
            {/* Price */}
            <div>
              <label className="block text-sm font-medium mb-1" htmlFor="price">
                {t("price")}
              </label>
              <input
                type="number"
                id="price"
                value={formData.price}
                onChange={(e) =>
                  setFormData({ ...formData, price: e.target.value })
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.price ? "border-red-500" : "border-gray-300"
                }`}
                step="0.01"
                min="0"
              />
              {errors.price && (
                <p className="text-red-500 text-sm mt-1">{errors.price}</p>
              )}
            </div>

            {/* Discount Price */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="discountPrice"
              >
                {t("discount_price")}
              </label>
              <input
                type="number"
                id="discountPrice"
                value={formData.discountPrice}
                onChange={(e) =>
                  setFormData({ ...formData, discountPrice: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                step="0.01"
                min="0"
              />
              {errors.discountPrice && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.discountPrice}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: Stock Information */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("stock_info")}</h2>
          <div className="space-y-4">
            {/* Stock Quantity */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="stockQuantity"
              >
                {t("stock_quantity")}
              </label>
              <input
                type="number"
                id="stockQuantity"
                value={formData.stockQuantity}
                onChange={(e) =>
                  setFormData({ ...formData, stockQuantity: e.target.value })
                }
                className={`w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-black ${
                  errors.stockQuantity ? "border-red-500" : "border-gray-300"
                }`}
                min="0"
              />
              {errors.stockQuantity && (
                <p className="text-red-500 text-sm mt-1">
                  {errors.stockQuantity}
                </p>
              )}
            </div>

            {/* Low Stock Alert */}
            <div>
              <label
                className="block text-sm font-medium mb-1"
                htmlFor="lowStockAlert"
              >
                {t("low_stock_alert")}
              </label>
              <input
                type="number"
                id="lowStockAlert"
                value={formData.lowStockAlert}
                onChange={(e) =>
                  setFormData({ ...formData, lowStockAlert: e.target.value })
                }
                className="w-full p-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-black"
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Media Upload */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("media_upload")}</h2>
          <div className="space-y-4">
            {/* Upload Images */}
            <div>
              <label className="block text-sm font-medium mb-1">
                {t("upload_images")}
              </label>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handleImageUpload}
                className="w-full"
              />
            </div>

            {/* Image Previews */}
            <div className="flex flex-wrap">
              {/* Existing images from server */}
              {existingImages.map((image, index) => (
                <div key={`existing-${index}`} className="relative m-2">
                  <img
                    src={image}
                    alt={`Product Image ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeExistingImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
              
              {/* Newly uploaded images */}
              {newImages.map((image, index) => (
                <div key={`new-${index}`} className="relative m-2">
                  <img
                    src={image.preview}
                    alt={`New Product Image ${index + 1}`}
                    className="w-24 h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeNewImage(index)}
                    className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                    aria-label="Remove image"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Section 5: Visibility */}
        <div>
          <h2 className="text-lg font-semibold mb-4">{t("visibility")}</h2>
          <div className="space-y-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={formData.isActive}
                onChange={(e) =>
                  setFormData({ ...formData, isActive: e.target.checked })
                }
                className="form-checkbox"
              />
              <span className="ml-2">{t("active")}</span>
            </label>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
          >
            {t("cancel")}
          </button>
          <button
            type="submit"
            className={`px-4 py-2 bg-black text-white rounded hover:bg-gray-800 transition-colors flex items-center justify-center ${
              isLoading ? "opacity-50 cursor-not-allowed" : ""
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-2 text-white"
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
                    d="M4 12a8 8 0 018-8v8H4z"
                  ></path>
                </svg>
                {t("saving")}...
              </>
            ) : (
              t("save_product")
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddEditProduct;