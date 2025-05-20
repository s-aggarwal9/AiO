import PurchaseInvoice from "../models/purchaseInvoice.model.js";
import Product from "../models/Product.model.js";
import Distributor from "../models/Distributor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import mongoose from "mongoose";

// Create a new purchase invoice
const createPurchaseInvoice = asyncHandler(async (req, res) => {
  const {
    invoiceNumber,
    distributor,
    items = [],
    paymentMethod,
    status,
    notes,
  } = req.body;

  // Validate required fields
  if (!invoiceNumber) {
    throw new ApiError(400, "Invoice number is required");
  }
  if (!distributor) {
    throw new ApiError(400, "Distributor is required");
  }
  if (!items || !items.length) {
    throw new ApiError(400, "Invoice must have at least one item");
  }

  // Get createdBy from the authenticated user (set by verifyJWT middleware)
  const createdBy = req.user?._id;
  if (!createdBy) {
    throw new ApiError(401, "User not authenticated");
  }

  // Start a Mongoose transaction
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      // Validate distributor exists
      const distributorDoc = await Distributor.findById(distributor).session(
        session
      );
      if (!distributorDoc) {
        throw new ApiError(404, "Distributor not found");
      }

      // Validate products and update stock
      const updatedItems = [];
      for (const item of items) {
        if (
          !item.product ||
          !item.quantity ||
          !item.rate ||
          !item.costPrice ||
          !item.mrp
        ) {
          throw new ApiError(
            400,
            "Each item must have product, quantity, rate, costPrice, and mrp"
          );
        }

        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new ApiError(404, `Product not found: ${item.product}`);
        }

        // Increase stock
        const newStock = product.stock + item.quantity;
        await Product.findByIdAndUpdate(
          item.product,
          { stock: newStock, distributor },
          { session, runValidators: true }
        );

        // Prepare item with denormalized product name
        updatedItems.push({
          ...item,
          name: product.name,
        });
      }

      // Create the purchase invoice
      const invoice = await PurchaseInvoice.create(
        [
          {
            invoiceNumber,
            distributor,
            items: updatedItems,
            paymentMethod: paymentMethod || "cash",
            status: status || "paid",
            notes,
            createdBy,
          },
        ],
        { session }
      );

      return invoice[0];
    });

    // Transaction succeeded
    return res
      .status(201)
      .json(
        new ApiResponse(201, result, "Purchase invoice created successfully")
      );
  } catch (error) {
    throw error; // asyncHandler will handle the error
  } finally {
    await session.endSession();
  }
});

// Get all purchase invoices
const getAllPurchaseInvoices = asyncHandler(async (req, res) => {
  const { startDate, endDate, distributorId } = req.query;

  // Build query
  const query = {};

  // Date range filter
  if (startDate && endDate) {
    query.createdAt = {
      $gte: new Date(startDate),
      $lte: new Date(endDate),
    };
  }

  // Distributor filter
  if (distributorId) {
    query.distributor = distributorId;
  }

  const invoices = await PurchaseInvoice.find(query)
    .populate("distributor", "name") // Populate distributor name
    .sort({ createdAt: -1 }); // Sort by date descending

  return res
    .status(200)
    .json(
      new ApiResponse(200, invoices, "Purchase invoices fetched successfully")
    );
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

// Delete a purchase invoice
const deletePurchaseInvoiceById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  // Start a Mongoose transaction
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      const invoice = await PurchaseInvoice.findById(id).session(session);
      if (!invoice) {
        throw new ApiError(404, "Purchase invoice not found");
      }

      // Revert stock changes
      for (const item of invoice.items) {
        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new ApiError(404, `Product not found: ${item.product}`);
        }

        const newStock = product.stock - item.quantity;
        await Product.findByIdAndUpdate(
          item.product,
          { stock: newStock },
          { session, runValidators: true }
        );
      }

      // Delete the invoice
      await PurchaseInvoice.findByIdAndDelete(id).session(session);

      return {};
    });

    // Transaction succeeded
    return res
      .status(200)
      .json(
        new ApiResponse(200, result, "Purchase invoice deleted successfully")
      );
  } catch (error) {
    throw error;
  } finally {
    await session.endSession();
  }
});

export {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
  deletePurchaseInvoiceById,
};
