import mongoose, { Schema, model } from "mongoose";

const purchaseItemSchema = new Schema({
  product: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, "Quantity cannot be less than 1"],
  },
  costPrice: {
    type: Number,
    required: true,
  },
  batchNo: String,
  manufacturingDate: Date,
  expiryDate: Date,
});

const purchaseInvoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
    },
    distributor: {
      type: String,
      required: true,
    },
    items: [purchaseItemSchema],
    totalAmount: {
      type: Number,
      required: true,
    },
    purchasedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

export const PurchaseInvoice = model("PurchaseInvoice", purchaseInvoiceSchema);
