import Invoice from "../models/Invoice.model.js";
import Product from "../models/Product.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { generateInvoicePDF } from "../utils/pdfGenerator.js";
import mongoose from "mongoose";

// Create a new invoice
const createInvoice = asyncHandler(async (req, res) => {
  const {
    customerName,
    customerPhone,
    customerAddress,
    items,
    totalAmount,
    paymentMethod,
    createdBy,
    invoiceNumber,
  } = req.body;

  // Validate that items exist and are not empty
  if (!items || !items.length) {
    throw new ApiError(400, "Invoice must have at least one item");
  }

  // Start a Mongoose transaction
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      // Validate stock for each item
      for (const item of items) {
        if (!item.product || !item.quantity) {
          throw new ApiError(400, "Each item must have a product and quantity");
        }

        const product = await Product.findById(item.product).session(session);
        if (!product) {
          throw new ApiError(404, `Product not found: ${item.product}`);
        }

        if (product.stock < item.quantity) {
          throw new ApiError(
            400,
            `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${item.quantity}`
          );
        }
      }

      // Create the invoice
      const invoice = await Invoice.create(
        [
          {
            customerName,
            customerPhone,
            customerAddress,
            items,
            totalAmount,
            paymentMethod,
            createdBy,
            invoiceNumber,
            subtotal: totalAmount,
          },
        ],
        { session }
      );

      // Update stock for each product
      for (const item of items) {
        const product = await Product.findById(item.product).session(session);
        const newStock = product.stock - item.quantity;

        await Product.findByIdAndUpdate(
          item.product,
          { stock: newStock },
          { session, runValidators: true }
        );
      }

      return invoice[0]; // Return the created invoice
    });

    // Transaction succeeded, return the response
    return res
      .status(201)
      .json(new ApiResponse(201, result, "Invoice created successfully"));
  } catch (error) {
    // Transaction failed, abort and throw the error
    throw error; // asyncHandler will catch and format the error
  } finally {
    // End the session
    await session.endSession();
  }
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
  const { startDate, endDate, customerName, page = 1, limit = 10 } = req.query;

  let filter = {};

  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  if (customerName) {
    filter.customerName = new RegExp(customerName, "i"); // case-insensitive
  }

  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);
  const skip = (pageNum - 1) * limitNum;

  const totalInvoices = await Invoice.countDocuments(filter);
  const invoices = await Invoice.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limitNum);

  return res.status(200).json(
    new ApiResponse(200, {
      invoices,
      totalInvoices,
      totalPages: Math.ceil(totalInvoices / limitNum),
      currentPage: pageNum,
    })
  );
});

// Update invoice - optional, depends on your requirements
// Update an existing invoice
const updateInvoice = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  // Start a Mongoose transaction
  const session = await mongoose.startSession();
  try {
    const result = await session.withTransaction(async () => {
      // Fetch the original invoice
      const originalInvoice = await Invoice.findById(id).session(session);
      if (!originalInvoice) {
        throw new ApiError(404, "Invoice not found");
      }

      // Validate that items exist if provided in the update
      if (updates.items && (!updates.items.length || !updates.items)) {
        throw new ApiError(400, "Invoice must have at least one item");
      }

      // If items are being updated, handle stock adjustments
      if (updates.items) {
        const oldItems = originalInvoice.items;
        const newItems = updates.items;

        // Create maps for easier comparison
        const oldItemsMap = new Map(
          oldItems.map((item) => [item.product.toString(), item])
        );
        const newItemsMap = new Map(
          newItems.map((item) => [item.product, item])
        );

        // Handle removed items (in oldItems but not in newItems): Increase stock
        for (const [productId, oldItem] of oldItemsMap) {
          if (!newItemsMap.has(productId)) {
            const product = await Product.findById(productId).session(session);
            if (!product) {
              throw new ApiError(404, `Product not found: ${productId}`);
            }
            const newStock = product.stock + oldItem.quantity;
            await Product.findByIdAndUpdate(
              productId,
              { stock: newStock },
              { session, runValidators: true }
            );
          }
        }

        // Handle added or modified items (in newItems)
        for (const [productId, newItem] of newItemsMap) {
          if (!newItem.product || !newItem.quantity) {
            throw new ApiError(
              400,
              "Each item must have a product and quantity"
            );
          }

          const product = await Product.findById(productId).session(session);
          if (!product) {
            throw new ApiError(404, `Product not found: ${productId}`);
          }

          if (oldItemsMap.has(productId)) {
            // Modified item: Adjust stock based on quantity difference
            const oldItem = oldItemsMap.get(productId);
            const quantityDiff = newItem.quantity - oldItem.quantity;

            if (quantityDiff !== 0) {
              const newStock = product.stock - quantityDiff;
              if (newStock < 0) {
                throw new ApiError(
                  400,
                  `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested additional: ${quantityDiff}`
                );
              }
              await Product.findByIdAndUpdate(
                productId,
                { stock: newStock },
                { session, runValidators: true }
              );
            }
          } else {
            // Added item: Decrease stock after validating
            if (product.stock < newItem.quantity) {
              throw new ApiError(
                400,
                `Insufficient stock for product: ${product.name}. Available: ${product.stock}, Requested: ${newItem.quantity}`
              );
            }
            const newStock = product.stock - newItem.quantity;
            await Product.findByIdAndUpdate(
              productId,
              { stock: newStock },
              { session, runValidators: true }
            );
          }
        }
      }

      // Update the invoice
      const updatedInvoice = await Invoice.findByIdAndUpdate(id, updates, {
        new: true,
        runValidators: true,
        session,
      });

      return updatedInvoice;
    });

    // Transaction succeeded, return the response
    return res
      .status(200)
      .json(new ApiResponse(200, result, "Invoice updated successfully"));
  } catch (error) {
    // Transaction failed, abort and throw the error
    throw error; // asyncHandler will catch and format the error
  } finally {
    // End the session
    await session.endSession();
  }
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
