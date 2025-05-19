"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

// create a new invoice
const AddInvoice = () => {
  const router = useRouter();
  const [products, setProducts] = useState([]);
  const [items, setItems] = useState([]);
  const [input, setInput] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [formData, setFormData] = useState({
    createdBy: "6829c0c4493c76425f5220af",
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
  const [invoiceId, setInvoiceId] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [showModal, setShowModal] = useState(false);

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
      // Autocomplete for name
      const filtered = products.filter((product) =>
        product.name.toLowerCase().includes(value.toLowerCase())
      );
      setSuggestions(filtered);
      // Check for barcode match
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
  const subtotal = items.reduce((sum, item) => sum + item.amount, 0);
  const totalAmount = subtotal; // Assuming tax = 0, discount = 0

  // Fetch and preview PDF
  const handlePreviewInvoice = async () => {
    if (!invoiceId) {
      setError("No invoice available to preview");
      return;
    }
    try {
      const response = await axios.get(`/api/v1/invoices/${invoiceId}/pdf`, {
        responseType: "blob",
        withCredentials: true,
      });
      const pdfBlob = new Blob([response.data], { type: "application/pdf" });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);
      setShowModal(true);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch invoice PDF");
    }
  };

  // Print PDF
  const handlePrintInvoice = () => {
    const iframe = document.getElementById("pdfIframe");
    if (iframe) {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }
  };

  // Close modal and clean up
  const closeModal = () => {
    setShowModal(false);
    if (pdfUrl) {
      URL.revokeObjectURL(pdfUrl);
      setPdfUrl(null);
    }
  };

  // Submit invoice
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.invoiceNumber) {
      setError("Invoice number is required");
      return;
    }
    if (items.length === 0) {
      setError("Please add at least one item to the invoice");
      return;
    }
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const invoiceData = {
        createdBy: formData.createdBy,
        invoiceNumber: formData.invoiceNumber,
        customerName: formData.customerName,
        customerPhone: formData.customerPhone,
        customerAddress: formData.customerAddress,
        items: items.map((item) => ({
          product: item.product._id,
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
        subtotal,
        tax: 0,
        discount: 0,
        totalAmount,
        paymentMethod: formData.paymentMethod,
        notes: formData.notes,
      };
      const response = await axios.post("/api/v1/invoices", invoiceData, {
        withCredentials: true,
      });
      setSuccess(response.data.message);
      setInvoiceId(response.data.data._id); // Store invoice ID for PDF preview
      setItems([]);
      setInput("");
      setSuggestions([]);
      setFormData({
        invoiceNumber: "",
        customerName: "Walk-in Customer",
        customerPhone: "",
        customerAddress: "",
        paymentMethod: "cash",
        notes: "",
      });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create invoice");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Add Invoice
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
          {success && (
            <div className="mb-4">
              <p className="text-green-600">{success}</p>
              {invoiceId && (
                <button
                  type="button"
                  onClick={handlePreviewInvoice}
                  className="mt-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
                >
                  Preview Invoice
                </button>
              )}
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Invoice Number *
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleFormChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
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
            disabled={loading || items.length === 0 || !formData.invoiceNumber}
            className={`w-full mt-6 bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${
              loading || items.length === 0 || !formData.invoiceNumber
                ? "opacity-50 cursor-not-allowed"
                : ""
            }`}
          >
            {loading ? "Creating Invoice..." : "Create Invoice"}
          </button>
        </form>
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-4xl max-h-[90vh] overflow-auto">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Invoice Preview
                </h2>
                <div className="space-x-2">
                  <button
                    onClick={handlePrintInvoice}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
                  >
                    Print
                  </button>
                  <button
                    onClick={closeModal}
                    className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                  >
                    Close
                  </button>
                </div>
              </div>
              <iframe
                id="pdfIframe"
                src={pdfUrl}
                className="w-full h-[70vh] border rounded-lg"
                title="Invoice PDF"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AddInvoice;
