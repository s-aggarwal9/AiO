"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";

const EditInvoice = () => {
  const router = useRouter();
  const { id } = useParams();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    customerName: "Walk-in Customer",
    customerPhone: "",
    customerAddress: "",
    paymentMethod: "cash",
    notes: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch invoice details
  useEffect(() => {
    const fetchInvoice = async () => {
      try {
        const response = await axios.get(`/api/v1/invoices/${id}`, {
          withCredentials: true,
        });
        const invoice = response.data.data;

        setFormData({
          invoiceNumber: invoice.invoiceNumber || "",
          customerName: invoice.customerName || "Walk-in Customer",
          customerPhone: invoice.customerPhone || "",
          customerAddress: invoice.customerAddress || "",
          paymentMethod: invoice.paymentMethod || "cash",
          notes: invoice.notes || "",
        });
        const formattedItems = invoice.items.map((item) => ({
          product: item.product,
          name: item.name,
          barcode: item.barcode || "",
          quantity: item.quantity,
          costPrice: item.costPrice,
          mrp: item.mrp,
          sellingPrice: item.sellingPrice || item.mrp,
          batchNo: item.batchNo || "",
          manufacturingDate: item.manufacturingDate || "",
          expiryDate: item.expiryDate || "",
          amount: item.quantity * (item.sellingPrice || item.mrp),
        }));
        setItems(formattedItems);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch invoice");
        setTimeout(() => router.push("/view-invoices"), 2000);
      }
    };
    if (id) fetchInvoice();
  }, [id, router]);

  // Fetch all products for autocomplete and barcode lookup
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get("/api/v1/products", {
          withCredentials: true,
        });
        setProducts(response.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch products");
      }
    };
    fetchProducts();
  }, []);

  // Handle input change for autocomplete and barcode
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInput(value);
    if (value) {
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      const barcodeMatch = products.find(
        (product) => product.barcode === value
      );
      if (barcodeMatch) {
        addOrUpdateItem(barcodeMatch);
        setInput("");
      }
    } else {
      setSuggestions([]);
    }
  };

  // Handle form field changes
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add or update item in the invoice
  const addOrUpdateItem = (product) => {
    setItems((prevItems) => {
      const existingItem = prevItems.find(
        (item) => item.product._id === product._id
      );
      if (existingItem) {
        return prevItems.map((item) =>
          item.product._id === product._id
            ? {
                ...item,
                quantity: item.quantity + 1,
                amount: (item.quantity + 1) * item.sellingPrice,
              }
            : item
        );
      }
      return [
        ...prevItems,
        {
          product,
          name: product.name,
          barcode: product.barcode || "",
          quantity: 1,
          costPrice: product.costPrice,
          mrp: product.mrp,
          sellingPrice: product.sellingPrice || product.mrp,
          batchNo: product.batchNo || "",
          manufacturingDate: product.mfgDate || "",
          expiryDate: product.expiryDate || "",
          amount: product.sellingPrice || product.mrp,
        },
      ];
    });
    setSuggestions([]);
  };

  // Handle suggestion click
  const handleSuggestionClick = (product) => {
    addOrUpdateItem(product);
    setInput("");
  };

  // Update quantity or sellingPrice
  const handleItemChange = (index, field, value) => {
    setItems((prevItems) =>
      prevItems.map((item, i) =>
        i === index
          ? {
              ...item,
              [field]:
                field === "quantity"
                  ? parseInt(value) || 1
                  : parseFloat(value) || item.sellingPrice,
              amount:
                field === "quantity"
                  ? (parseInt(value) || 1) * item.sellingPrice
                  : item.quantity * (parseFloat(value) || item.sellingPrice),
            }
          : item
      )
    );
  };

  // Remove item
  const removeItem = (index) => {
    setItems((prevItems) => prevItems.filter((_, i) => i !== index));
  };

  // Calculate totals
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalAmount = items.reduce((sum, item) => sum + item.amount, 0);

  // Submit updated invoice
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      setError("Please add at least one item to the invoice");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const invoiceData = {
        invoiceNumber: formData.invoiceNumber,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: items.map((item) => ({
          product: item.product, //yaha imp hai
          name: item.name,
          barcode: item.barcode,
          quantity: item.quantity,
          costPrice: item.costPrice,
          mrp: item.mrp,
          sellingPrice: item.sellingPrice,
          batchNo: item.batchNo,
          manufacturingDate: item.manufacturingDate,
          expiryDate: item.expiryDate,
        })),
        subtotal: totalAmount,
        tax: 0,
        discount: 0,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };
      const response = await axios.put(`/api/v1/invoices/${id}`, invoiceData, {
        withCredentials: true,
      });
      setSuccess(response.data.message || "Invoice updated successfully");
      setTimeout(() => router.push("/view-invoices"), 2000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Edit Invoice
          </h1>
          <button
            onClick={() => router.push("/view-invoices")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Cancel
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 rounded-xl shadow-sm border border-gray-200"
        >
          {error && <p className="text-red-600 mb-4">{error}</p>}
          {success && <p className="text-green-600 mb-4">{success}</p>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Invoice Number
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                readOnly
                className="w-full p-2 border rounded-lg bg-gray-100 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Customer Name
              </label>
              <input
                type="text"
                name="customerName"
                value={formData.customerName}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Customer Phone
              </label>
              <input
                type="text"
                name="customerPhone"
                value={formData.customerPhone}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Customer Address
              </label>
              <input
                type="text"
                name="customerAddress"
                value={formData.customerAddress}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
              />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-700 font-medium mb-1">
              Search Product or Scan Barcode
            </label>
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Type product name or scan barcode"
              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {suggestions.length > 0 && (
              <ul className="mt-2 bg-white border rounded-lg max-h-40 overflow-y-auto">
                {suggestions.map((product) => (
                  <li
                    key={product._id}
                    onClick={() => handleSuggestionClick(product)}
                    className="p-2 hover:bg-blue-50 cursor-pointer"
                  >
                    {product.name} (Barcode: {product.barcode || "N/A"})
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    S.No
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Item
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Qty
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Value of Supply
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          handleItemChange(index, "quantity", e.target.value)
                        }
                        min="1"
                        className="w-20 p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <input
                        type="number"
                        value={item.sellingPrice}
                        onChange={(e) =>
                          handleItemChange(
                            index,
                            "sellingPrice",
                            e.target.value
                          )
                        }
                        min="0"
                        step="0.01"
                        className="w-24 p-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ₹{item.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => removeItem(index)}
                        className="text-red-600 hover:text-red-800"
                      >
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
                {items.length > 0 && (
                  <tr className="bg-gray-50">
                    <td
                      colSpan="2"
                      className="px-6 py-4 text-sm font-medium text-gray-900"
                    >
                      Total
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {totalQuantity}
                    </td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4"></td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ₹{totalAmount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4"></td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <button
            type="submit"
            disabled={loading || items.length === 0}
            className={`w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${
              loading || items.length === 0
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? "Updating Invoice..." : "Update Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditInvoice;
