import Invoice from "../models/Invoice.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create a new invoice
const createInvoice = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    items,
    totalAmount,
    paymentMethod,
  } = req.body;

  if (!items || !items.length) {
    throw new ApiError(400, "Invoice must have at least one item");
  }

  // Optional: Validate each item has product and quantity

  const invoice = await Invoice.create({
    customerName,
    customerPhone,
    customerAddress,
    items,
    totalAmount,
    paymentMethod,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, invoice, "Invoice created successfully"));
});

// Get invoice by ID
const getInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return res.status(200).json(new ApiResponse(200, invoice));
});

// Get all invoices, with optional filters (e.g. date range)
const getAllInvoices = asyncHandler(async (req, res) => {
  const { startDate, endDate, customerName } = req.query;

  let filter = {};

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (customerName) {
    filter.customerName = new RegExp(customerName, "i"); // case-insensitive
  }

  const invoices = await Invoice.find(filter).sort({ createdAt: -1 });

  return res.status(200).json(new ApiResponse(200, invoices));
});

// Update invoice - optional, depends on your requirements
const updateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const invoice = await Invoice.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, invoice, "Invoice updated successfully"));
});

// Delete invoice - optional, if you want to support deletion
const deleteInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await Invoice.findByIdAndDelete(id);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  return res.status(200).json(new ApiResponse(200, null, "Invoice deleted"));
});

//pdf
const getInvoicePDF = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const invoice = await Invoice.findById(id);
  if (!invoice) {
    throw new ApiError(404, "Invoice not found");
  }

  const pdfBuffer = await generateInvoicePDF(invoice);

  res.set({
    "Content-Type": "application/pdf",
    "Content-Disposition": `inline; filename=invoice_${invoice._id}.pdf`,
    "Content-Length": pdfBuffer.length,
  });

  return res.send(pdfBuffer);
});

export {
  createInvoice,
  getInvoiceById,
  getAllInvoices,
  updateInvoice,
  deleteInvoice,
  getInvoicePDF,
};
