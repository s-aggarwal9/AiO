import { PurchaseInvoice } from "../models/purchaseInvoice.model.js";
import Product from "../models/Product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// Create Purchase Invoice
const createPurchaseInvoice = asyncHandler(async (req, res) => {
  const { invoiceNumber, distributor, items = [] } = req.body;

  if (!invoiceNumber || !distributor || items.length === 0) {
    throw new ApiError(400, "All fields including items are required");
  }

  let totalAmount = 0;

  // Update product stock and calculate total amount
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new ApiError(404, `Product not found: ${item.product}`);
    }

    product.stock += item.quantity;
    await product.save();

    totalAmount += item.costPrice * item.quantity;
  }

  const purchaseInvoice = await PurchaseInvoice.create({
    invoiceNumber,
    distributor,
    items,
    totalAmount,
    purchasedBy: req.user._id,
  });

  res
    .status(201)
    .json(
      new ApiResponse(
        201,
        purchaseInvoice,
        "Purchase invoice created successfully"
      )
    );
});

// Get All Purchase Invoices
const getAllPurchaseInvoices = asyncHandler(async (req, res) => {
  const invoices = await PurchaseInvoice.find()
    .populate("items.product", "name barcode")
    .populate("purchasedBy", "name email");

  res.status(200).json(new ApiResponse(200, invoices));
});

// Get One Purchase Invoice by ID
const getPurchaseInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const invoice = await PurchaseInvoice.findById(id)
    .populate("items.product", "name barcode")
    .populate("purchasedBy", "name email");

  if (!invoice) {
    throw new ApiError(404, "Purchase invoice not found");
  }

  res.status(200).json(new ApiResponse(200, invoice));
});

export {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
};
