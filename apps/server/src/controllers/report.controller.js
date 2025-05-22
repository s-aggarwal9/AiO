import Invoice from "../models/Invoice.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const getSalesReport = asyncHandler(async (req, res) => {
  const { startDate, endDate, paymentMethod, status } = req.query;

  const query = {};

  if (startDate && endDate) {
    const start = new Date(startDate);
    const end = new Date(endDate);
    end.setDate(end.getDate() + 1);

    query.createdAt = {
      $gte: start,
      $lt: end,
    };
  }

  if (paymentMethod) query.paymentMethod = paymentMethod;
  if (status) query.status = status;

  const invoices = await Invoice.find(query)
    .select("invoiceNumber createdAt customerName totalAmount paymentMethod")
    .sort({ createdAt: -1 });

  return res
    .status(200)
    .json(new ApiResponse(200, invoices, "Sales report fetched successfully"));
});

export { getSalesReport };
