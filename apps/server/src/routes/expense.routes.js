// routes/expenseRoutes.js

import { Router } from "express";

const router = Router();
import {
  addExpense,
  deleteExpense,
  getAllExpenses,
} from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/").post(verifyJWT, addExpense).get(verifyJWT, getAllExpenses);
router.route("/:id").delete(verifyJWT, deleteExpense);

export default router;
