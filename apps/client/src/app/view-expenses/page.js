// app/view-expenses/page.js
"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { TrashIcon } from "@heroicons/react/24/outline";

const ViewExpenses = () => {
  const router = useRouter();
  const [expensesData, setExpensesData] = useState({
    expenses: [],
    pagination: { currentPage: 1, totalPages: 1, totalExpenses: 0 },
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);

  const fetchExpenses = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await axios.get(`/api/v1/expenses?page=${page}`, {
        withCredentials: true,
      });
      setExpensesData(response.data.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch expenses");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this expense?")) return;
    try {
      await axios.delete(`/api/v1/expenses/${id}`, { withCredentials: true });
      fetchExpenses(); // Refresh the list
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete expense");
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [page]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            View Expenses
          </h1>
          <button
            onClick={() => router.push("/dashboard")}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Back to Dashboard
          </button>
        </div>

        {error && <p className="text-red-600 mb-4">{error}</p>}
        {loading ? (
          <p className="text-gray-600">Loading expenses...</p>
        ) : expensesData.expenses.length === 0 ? (
          <p className="text-gray-600">No expenses found.</p>
        ) : (
          <>
            <div className="overflow-x-auto bg-white rounded-xl shadow-sm border border-gray-200 mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expense Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created By
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {expensesData.expenses.map((expense) => (
                    <tr key={expense._id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.expenseType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        ₹{expense.amount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(expense.date).toLocaleDateString("en-IN")}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {expense.description || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {expense.createdBy?.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDelete(expense._id)}
                          className="text-red-600 hover:text-red-800 font-medium"
                        >
                          <TrashIcon className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex justify-center space-x-2 mb-6">
              <button
                onClick={() =>
                  handlePageChange(expensesData.pagination.currentPage - 1)
                }
                disabled={expensesData.pagination.currentPage === 1}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              {Array.from(
                { length: expensesData.pagination.totalPages },
                (_, i) => i + 1
              ).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => handlePageChange(pageNum)}
                  className={`px-4 py-2 rounded-lg ${
                    expensesData.pagination.currentPage === pageNum
                      ? "bg-blue-600 text-white"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {pageNum}
                </button>
              ))}
              <button
                onClick={() =>
                  handlePageChange(expensesData.pagination.currentPage + 1)
                }
                disabled={
                  expensesData.pagination.currentPage ===
                  expensesData.pagination.totalPages
                }
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ViewExpenses;
