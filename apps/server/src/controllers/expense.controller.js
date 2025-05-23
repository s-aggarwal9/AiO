// controllers/expenseController.js

import Expense from "../models/Expense.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

const addExpense = asyncHandler(async (req, res) => {
  const { expenseType, amount, description, date } = req.body;

  if (!expenseType || !amount || !date) {
    throw new ApiError(400, "Expense type, amount, and date are required");
  }

  const createdBy = req.user?._id;
  if (!createdBy) {
    throw new ApiError(401, "User not authenticated");
  }

  const expense = await Expense.create({
    expenseType,
    amount,
    description,
    date: new Date(date),
    createdBy,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, expense, "Expense added successfully"));
});

const getAllExpenses = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10 } = req.query;

  const expenses = await Expense.find()
    .populate("createdBy", "name")
    .sort({ date: -1 })
    .skip((page - 1) * limit)
    .limit(parseInt(limit));

  const totalExpenses = await Expense.countDocuments();

  const result = {
    expenses,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(totalExpenses / limit),
      totalExpenses,
    },
  };

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Expenses fetched successfully"));
});

const deleteExpense = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const expense = await Expense.findById(id);
  if (!expense) {
    throw new ApiError(404, "Expense not found");
  }

  await Expense.findByIdAndDelete(id);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Expense deleted successfully"));
});

export { addExpense, deleteExpense, getAllExpenses };
