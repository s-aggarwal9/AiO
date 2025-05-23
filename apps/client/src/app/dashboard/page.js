"use client";

import React from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await axios.post(`/api/v1/users/logout`, { withCredentials: true });
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  // const navigateTo = (path) => {
  //   router.push(`/${path.toLowerCase().replace(/\s+/g, "-")}`);
  // };

  const navigateTo = (title) => {
    // Custom mapping for nested routes
    const routeMap = {
      "Sales Report": "reports/sales-report",
    };

    // Use the mapped route if it exists, otherwise fallback to the default logic
    const path = routeMap[title] || title.toLowerCase().replace(/\s+/g, "-");
    router.push(`/${path}`);
  };

  const DashboardCard = ({ title }) => (
    <button
      onClick={() => navigateTo(title)}
      className="bg-white text-gray-800 rounded-xl p-6 text-center text-lg font-medium hover:bg-blue-50 hover:shadow-lg transition-all duration-300 w-full h-40 flex items-center justify-center shadow-sm border border-gray-200"
    >
      {title}
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6 md:p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
            Dashboard
          </h1>
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition duration-300"
          >
            Logout
          </button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <DashboardCard title="Add Invoice" />
          <DashboardCard title="Add Purchase Invoice" />
          <DashboardCard title="Add Product" />
          <DashboardCard title="Add Distributor" />
          <DashboardCard title="View Invoices" />
          <DashboardCard title="View Purchase Invoices" />
          <DashboardCard title="View Products" />
          <DashboardCard title="View Distributors" />
          <DashboardCard title="Sales Report" />
          <DashboardCard title="Add Expense" />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
