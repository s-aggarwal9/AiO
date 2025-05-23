// models/expense.js
import mongoose, { Schema, model } from "mongoose";

const expenseSchema = new Schema(
  {
    expenseType: {
      type: String,
      enum: [
        "employee",
        "electricity",
        "maintenance",
        "marketing",
        "miscellaneous",
      ],
      required: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      trim: true,
    },
    date: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true }
);

const Expense = model("Expense", expenseSchema);

export default Expense;
