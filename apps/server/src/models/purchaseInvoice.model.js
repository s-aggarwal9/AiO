import mongoose, { Schema, model } from "mongoose";

const purchaseInvoiceItemSchema = new Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  name: { type: String, required: true }, // Denormalized for history
  barcode: { type: String },
  quantity: { type: Number, required: true, min: 1 },
  rate: { type: Number, required: true, min: 0 },
  discount: { type: Number, default: 0, min: 0 },
  sgst: { type: Number, default: 0, min: 0 },
  cgst: { type: Number, default: 0, min: 0 },
  igst: { type: Number, default: 0, min: 0 },
  netAmount: { type: Number, required: true }, // Calculated: (rate * quantity) - discount + sgst + cgst + igst
  costPrice: { type: Number, required: true },
  mrp: { type: Number, required: true },
  batchNo: { type: String },
  manufacturingDate: { type: Date },
  expiryDate: { type: Date },
});

const purchaseInvoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    supplier: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Supplier",
      required: true,
    },
    items: [purchaseInvoiceItemSchema],
    subtotal: { type: Number, required: true }, // Sum of (rate * quantity)
    tax: { type: Number, default: 0 }, // Sum of sgst + cgst + igst across items
    discount: { type: Number, default: 0 }, // Sum of discounts across items
    totalAmount: { type: Number, required: true }, // subtotal - discount + tax
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

// Pre-save hook to calculate netAmount, subtotal, tax, discount, and totalAmount
purchaseInvoiceSchema.pre("save", function (next) {
  // Calculate netAmount for each item
  this.items.forEach((item) => {
    const baseAmount = item.rate * item.quantity;
    item.netAmount =
      baseAmount -
      (item.discount || 0) +
      (item.sgst || 0) +
      (item.cgst || 0) +
      (item.igst || 0);
  });

  // Calculate subtotal, tax, discount, and totalAmount
  this.subtotal = this.items.reduce(
    (sum, item) => sum + item.rate * item.quantity,
    0
  );
  this.discount = this.items.reduce(
    (sum, item) => sum + (item.discount || 0),
    0
  );
  this.tax = this.items.reduce(
    (sum, item) => sum + (item.sgst || 0) + (item.cgst || 0) + (item.igst || 0),
    0
  );
  this.totalAmount = this.subtotal - this.discount + this.tax;

  next();
});

const PurchaseInvoice = model("PurchaseInvoice", purchaseInvoiceSchema);

export default PurchaseInvoice;
