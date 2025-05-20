"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";

const EditPurchaseInvoice = () => {
  const router = useRouter();
  const { id } = useParams();
  const [formData, setFormData] = useState({
    invoiceNumber: "",
    distributor: "",
    items: [],
    paymentMethod: "cash",
    status: "paid",
    notes: "",
  });
  const [distributors, setDistributors] = useState([]);
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetchLoading, setFetchLoading] = useState(true);

  // Fetch invoice, distributors, and products on mount
  useEffect(() => {
    const fetchData = async () => {
      setFetchLoading(true);
      try {
        const [invoiceRes, distributorsRes, productsRes] = await Promise.all([
          axios.get(`/api/v1/purchase-invoices/${id}`, {
            withCredentials: true,
          }),
          axios.get("/api/v1/distributors", { withCredentials: true }),
          axios.get("/api/v1/products", { withCredentials: true }),
        ]);
        const invoice = invoiceRes.data.data;
        // console.log(invoice.distributor.name);
        setFormData({
          invoiceNumber: invoice.invoiceNumber,
          distributor: invoice.distributor.name || "",
          items: invoice.items.map((item) => ({
            ...item,
            product: item.product?._id || item.product, // Ensure product is the ID
          })),
          paymentMethod: invoice.paymentMethod,
          status: invoice.status,
          notes: invoice.notes,
        });
        setDistributors(distributorsRes.data.data);
        setProducts(productsRes.data.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to fetch data");
      } finally {
        setFetchLoading(false);
      }
    };
    fetchData();
  }, [id]);

  // Handle input changes for top-level fields
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Add a new item
  const addItem = () => {
    setFormData((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        {
          product: "",
          name: "",
          quantity: 1,
          rate: 0,
          discount: 0,
          sgst: 0,
          cgst: 0,
          igst: 0,
          netAmount: 0,
          costPrice: 0,
          mrp: 0,
          batchNo: "",
          manufacturingDate: "",
          expiryDate: "",
        },
      ],
    }));
  };

  // Remove an item
  const removeItem = (index) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  // Handle item field changes
  const handleItemChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedItems = [...prev.items];
      updatedItems[index] = { ...updatedItems[index], [field]: value };

      // If product is selected, set the name, costPrice, and mrp
      if (field === "product") {
        const selectedProduct = products.find((p) => p._id === value);
        if (selectedProduct) {
          updatedItems[index].name = selectedProduct.name;
          updatedItems[index].costPrice = selectedProduct.costPrice || 0;
          updatedItems[index].mrp = selectedProduct.mrp || 0;
        }
      }

      // Calculate netAmount for the item
      const item = updatedItems[index];
      const baseAmount = (item.quantity || 0) * (item.rate || 0);
      item.netAmount =
        baseAmount -
        (item.discount || 0) +
        (item.sgst || 0) +
        (item.cgst || 0) +
        (item.igst || 0);

      return { ...prev, items: updatedItems };
    });
  };

  // Calculate totals for display purposes
  const calculateTotals = () => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.rate || 0),
      0
    );
    const discount = formData.items.reduce(
      (sum, item) => sum + (item.discount || 0),
      0
    );
    const tax = formData.items.reduce(
      (sum, item) =>
        sum + (item.sgst || 0) + (item.cgst || 0) + (item.igst || 0),
      0
    );
    const totalAmount = subtotal - discount + tax;

    return { subtotal, discount, tax, totalAmount };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const data = {
        invoiceNumber: formData.invoiceNumber,
        distributor: formData.distributor,
        items: formData.items,
        paymentMethod: formData.paymentMethod,
        status: formData.status,
        notes: formData.notes,
      };

      const response = await axios.put(
        `/api/v1/purchase-invoices/${id}`,
        data,
        {
          withCredentials: true,
        }
      );
      setSuccess(response.data.message);
      setTimeout(() => router.push("/view-purchase-invoices"), 1500);
    } catch (err) {
      setError(
        err.response?.data?.message || "Failed to update purchase invoice"
      );
    } finally {
      setLoading(false);
    }
  };

  const totals = calculateTotals();

  if (fetchLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Edit Purchase Invoice
          </h1>
          <button
            onClick={() => router.push("/view-purchase-invoices")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back to View Invoices
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
                Invoice Number *
              </label>
              <input
                type="text"
                name="invoiceNumber"
                value={formData.invoiceNumber}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Distributor
              </label>
              <input
                type="text"
                value={formData.distributor}
                className="w-full p-2 border rounded-lg bg-gray-100 text-gray-700"
                readOnly
              />
            </div>
            {/* <div>
              <label className="block text-gray-700 font-medium mb-1">
                Distributor *
              </label>
              <select
                name="distributor"
                value={formData.distributor}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Select Distributor</option>
                {distributors.map((distributor) => (
                  <option key={distributor._id} value={distributor._id}>
                    {distributor.name}
                  </option>
                ))}
              </select>
            </div> */}
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Payment Method
              </label>
              <select
                name="paymentMethod"
                value={formData.paymentMethod}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="cash">Cash</option>
                <option value="card">Card</option>
                <option value="upi">UPI</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Status
              </label>
              <select
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="paid">Paid</option>
                <option value="unpaid">Unpaid</option>
                <option value="pending">Pending</option>
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-gray-700 font-medium mb-1">
                Notes
              </label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
              />
            </div>
          </div>

          {/* Items Table */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Items</h2>
            <button
              type="button"
              onClick={addItem}
              className="mb-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition duration-300"
            >
              Add Item
            </button>
            {formData.items.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Product
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Quantity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Rate
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Discount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        SGST
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CGST
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        IGST
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Net Amount
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formData.items.map((item, index) => (
                      <tr key={index}>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <select
                            value={item.product}
                            onChange={(e) =>
                              handleItemChange(index, "product", e.target.value)
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            required
                          >
                            <option value="">Select Product</option>
                            {products.map((product) => (
                              <option key={product._id} value={product._id}>
                                {product.name}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "quantity",
                                parseInt(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="1"
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.rate}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "rate",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                            required
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.discount}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "discount",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.sgst}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "sgst",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.cgst}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "cgst",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <input
                            type="number"
                            value={item.igst}
                            onChange={(e) =>
                              handleItemChange(
                                index,
                                "igst",
                                parseFloat(e.target.value) || 0
                              )
                            }
                            className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            min="0"
                            step="0.01"
                          />
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap text-sm text-gray-900">
                          ₹{item.netAmount.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => removeItem(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <TrashIcon className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-gray-600">No items added yet.</p>
            )}
          </div>

          {/* Totals */}
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Totals</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-gray-700 font-medium">
                  Subtotal
                </label>
                <p className="text-gray-900">₹{totals.subtotal.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Discount
                </label>
                <p className="text-gray-900">₹{totals.discount.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">Tax</label>
                <p className="text-gray-900">₹{totals.tax.toFixed(2)}</p>
              </div>
              <div>
                <label className="block text-gray-700 font-medium">
                  Total Amount
                </label>
                <p className="text-gray-900 font-bold">
                  ₹{totals.totalAmount.toFixed(2)}
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition duration-300 ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Updating Invoice..." : "Update Purchase Invoice"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default EditPurchaseInvoice;
