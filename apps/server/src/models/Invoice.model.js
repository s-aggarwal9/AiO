import mongoose, { Schema, model } from "mongoose";

const invoiceItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // denormalized for history
  barcode: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  costPrice: { type: Number, required: true },
  mrp: { type: Number, required: true },
  sellingPrice: { type: Number, required: true },
  batchNo: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
});

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    customerName: { type: String, default: "Walk-in Customer" },
    customerPhone: { type: String },
    items: [invoiceItemSchema],
    subtotal: { type: Number, required: true },
    tax: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    totalAmount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "upi", "other"],
      default: "cash",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["paid", "unpaid", "pending"],
      default: "paid",
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const Invoice = model("Invoice", invoiceSchema);

export default Invoice;
