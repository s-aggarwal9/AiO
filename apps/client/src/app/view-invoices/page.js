"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { EyeIcon, PencilIcon, TrashIcon } from "@heroicons/react/24/outline";

const ViewInvoices = () => {
  const router = useRouter();
  const [invoices, setInvoices] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    startDate: "",
    endDate: "",
    customerName: "",
  });
  const [sortOrder, setSortOrder] = useState("asc");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState(null);

  const fetchInvoices = async (page = 1) => {
    try {
      const params = {
        page,
        limit: 10,
        ...filters,
      };
      const response = await axios.get("/api/v1/invoices", {
        params,
        withCredentials: true,
      });
      setInvoices(response.data.data.invoices);
      setTotalPages(response.data.data.totalPages);
      setCurrentPage(response.data.data.currentPage);
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch invoices");
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyFilters = () => {
    setCurrentPage(1);
    fetchInvoices(1);
  };

  const handleClearFilters = () => {
    setFilters({
      startDate: "",
      endDate: "",
      customerName: "",
    });
    setCurrentPage(1);
    fetchInvoices(1);
  };

  const handlePageChange = (newPage) => {
    setCurrentPage(newPage);
    fetchInvoices(newPage);
  };

  const handleSortByInvoiceNumber = () => {
    const newSortOrder = sortOrder === "asc" ? "desc" : "asc";
    setSortOrder(newSortOrder);
    setInvoices((prevInvoices) =>
      [...prevInvoices].sort((a, b) => {
        if (newSortOrder === "asc") {
          return a.invoiceNumber.localeCompare(b.invoiceNumber);
        }
        return b.invoiceNumber.localeCompare(a.invoiceNumber);
      })
    );
  };

  const handleViewInvoice = (id) => {
    window.open(`/api/v1/invoices/${id}/pdf`, "_blank");
  };

  const handleEditInvoice = (id) => {
    router.push(`/edit-invoice/${id}`);
  };

  // Handle edit navigation
  // const handleEdit = (productId) => {
  //   router.push(`/edit-product?id=${productId}`);
  // };

  const confirmDelete = (invoice) => {
    setInvoiceToDelete(invoice);
    setShowDeleteModal(true);
  };

  const handleDeleteInvoice = async () => {
    if (!invoiceToDelete) return;
    try {
      const response = await axios.delete(
        `/api/v1/invoices/${invoiceToDelete._id}`,
        {
          withCredentials: true,
        }
      );
      setSuccess(response.data.message || "Invoice deleted successfully");
      setError("");
      setShowDeleteModal(false);
      setInvoiceToDelete(null);
      fetchInvoices(currentPage);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete invoice");
      setSuccess("");
      setShowDeleteModal(false);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-IN");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            View Invoices
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Filter Invoices
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Start Date
              </label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                End Date
              </label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-1">
                Customer Name
              </label>
              <input
                type="text"
                name="customerName"
                value={filters.customerName}
                onChange={handleFilterChange}
                placeholder="Enter customer name"
                className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={handleApplyFilters}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
              >
                Apply Filters
              </button>
              <button
                onClick={handleClearFilters}
                className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {success && <p className="text-green-600 mb-4">{success}</p>}

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  S.No
                </th>
                <th
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                  onClick={handleSortByInvoiceNumber}
                >
                  Invoice Number {sortOrder === "asc" ? "↑" : "↓"}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Total Amount
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Payment Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {invoices.map((invoice, index) => (
                <tr key={invoice._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {(currentPage - 1) * 10 + index + 1}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.customerName || "Walk-in Customer"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(invoice.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    ₹{invoice.totalAmount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {invoice.paymentMethod}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleViewInvoice(invoice._id)}
                        className="text-blue-600 hover:text-blue-800"
                        title="View PDF"
                      >
                        <EyeIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleEditInvoice(invoice._id)}
                        className="text-gray-600 hover:text-gray-800"
                        title="Edit"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => confirmDelete(invoice)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg ${
                currentPage === 1
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition duration-300`}
            >
              Previous
            </button>
            <span className="text-gray-700">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg ${
                currentPage === totalPages
                  ? "bg-gray-300 cursor-not-allowed"
                  : "bg-blue-600 text-white hover:bg-blue-700"
              } transition duration-300`}
            >
              Next
            </button>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Confirm Deletion
              </h2>
              <p className="text-gray-700 mb-6">
                Are you sure you want to delete invoice #
                {invoiceToDelete?.invoiceNumber}?
              </p>
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="bg-gray-300 text-gray-900 px-4 py-2 rounded-lg hover:bg-gray-400 transition duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteInvoice}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ViewInvoices;
