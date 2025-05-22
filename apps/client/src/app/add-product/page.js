"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

const AddProduct = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category: "",
    distributor: "",
    stock: "",
    costPrice: "",
    mrp: "",
    sellingPrice: "",
    batchNo: "",
    mfgDate: "",
    expiryDate: "",
    addedBy: "6829c0c4493c76425f5220af", //addedBy dhyaan se hatana hai
  });
  const [productImage, setProductImage] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // const {
  //   name,
  //   barcode,
  //   category,
  //   distributor,
  //   stock,
  //   costPrice,
  //   mrp,
  //   sellingPrice,
  //   batchNo,
  //   mfgDate,
  //   expiryDate,
  //   addedBy,
  // } = req.body;

  // const dummyData = [
  //   {
  //     name: "Milk",
  //     barcode: "1001",
  //     category: "Dairy",
  //     distributor: "682c11637b3a6290c76d5caa",
  //     stock: 150,
  //     costPrice: 22,
  //     mrp: 28,
  //     sellingPrice: 26,
  //     batchNo: "B001",
  //     mfgDate: "2025-05-01",
  //     expiryDate: "2025-06-01",
  //     addedBy: "6829c0c4493c76425f5220af",
  //   },
  //   {
  //     name: "Bread",
  //     barcode: "1002",
  //     category: "Bakery",
  //     distributor: "682c11637b3a6290c76d5caa",
  //     stock: 80,
  //     costPrice: 18,
  //     mrp: 25,
  //     sellingPrice: 22,
  //     batchNo: "B002",
  //     mfgDate: "2025-05-15",
  //     expiryDate: "2025-05-30",
  //     addedBy: "6829c0c4493c76425f5220af",
  //   },
  //   {
  //     name: "Butter",
  //     barcode: "1003",
  //     category: "Dairy",
  //     distributor: "682c11637b3a6290c76d5caa",
  //     stock: 60,
  //     costPrice: 45,
  //     mrp: 55,
  //     sellingPrice: 52,
  //     batchNo: "B003",
  //     mfgDate: "2025-04-20",
  //     expiryDate: "2025-07-20",
  //     addedBy: "6829c0c4493c76425f5220af",
  //   },
  //   {
  //     name: "Eggs",
  //     barcode: "1004",
  //     category: "Poultry",
  //     distributor: "682c11637b3a6290c76d5caa",
  //     stock: 200,
  //     costPrice: 5,
  //     mrp: 8,
  //     sellingPrice: 7,
  //     batchNo: "B004",
  //     mfgDate: "2025-05-18",
  //     expiryDate: "2025-06-01",
  //     addedBy: "6829c0c4493c76425f5220af",
  //   },
  //   {
  //     name: "Orange Juice",
  //     barcode: "1005",
  //     category: "Beverages",
  //     distributor: "682c11637b3a6290c76d5caa",
  //     stock: 120,
  //     costPrice: 30,
  //     mrp: 40,
  //     sellingPrice: 38,
  //     batchNo: "B005",
  //     mfgDate: "2025-05-10",
  //     expiryDate: "2025-08-10",
  //     addedBy: "6829c0c4493c76425f5220af",
  //   },
  // ];

  // useEffect(() => {
  //   dummyData.map(async (item) => {
  //     const res = await axios.post("/api/v1/products/create", item, {
  //       headers: { "Content-Type": "multipart/form-data" },
  //       withCredentials: true,
  //     });
  //   });
  // });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setProductImage(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      if (formData[key]) data.append(key, formData[key]);
    });
    if (productImage) data.append("file", productImage);

    try {
      const response = await axios.post("/api/v1/products/create", data, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true,
      });
      setSuccess(response.data.message);
      setFormData({
        name: "",
        barcode: "",
        category: "",
        distributor: "",
        stock: "",
        costPrice: "",
        mrp: "",
        sellingPrice: "",
        batchNo: "",
        mfgDate: "",
        expiryDate: "",
      });
      setProductImage(null);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create product");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Add Product
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Product Name *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Barcode *
              </label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Category *
              </label>
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Distributor *
              </label>
              <input
                type="text"
                name="distributor"
                value={formData.distributor}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Stock *
              </label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleInputChange}
                min="0"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Cost Price *
              </label>
              <input
                type="number"
                name="costPrice"
                value={formData.costPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                MRP *
              </label>
              <input
                type="number"
                name="mrp"
                value={formData.mrp}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Selling Price
              </label>
              <input
                type="number"
                name="sellingPrice"
                value={formData.sellingPrice}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Batch Number
              </label>
              <input
                type="text"
                name="batchNo"
                value={formData.batchNo}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Manufacturing Date
              </label>
              <input
                type="date"
                name="mfgDate"
                value={formData.mfgDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Expiry Date
              </label>
              <input
                type="date"
                name="expiryDate"
                value={formData.expiryDate}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Product Image
              </label>
              <input
                type="file"
                name="file"
                onChange={handleFileChange}
                accept="image/*"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Adding Product..." : "Add Product"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddProduct;
