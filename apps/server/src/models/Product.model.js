import mongoose, { Schema, model } from "mongoose";

const productSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    barcode: {
      type: String,
      unique: true,
      sparse: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    distributor: {
      type: String,
      required: true,
      trim: true,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    costPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    mrp: {
      type: Number,
      required: true,
      min: 0,
    },
    sellingPrice: {
      type: Number,
      min: 0,
    },
    batchNo: {
      type: String,
      default: null,
      trim: true,
    },
    mfgDate: {
      type: Date,
      default: null,
    },
    expiryDate: {
      type: Date,
      default: null,
    },
    productImage: {
      type: String,
      default: null,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Pre-save hook to set default sellingPrice = mrp if not provided
productSchema.pre("save", function (next) {
  if (this.isNew && !this.sellingPrice) {
    this.sellingPrice = this.mrp;
  }
  next();
});

const Product = model("Product", productSchema);
export default Product;
