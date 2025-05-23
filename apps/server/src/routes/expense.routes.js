// routes/expenseRoutes.js

import { Router } from "express";

const router = Router();
import {
  addExpense,
  deleteExpense,
} from "../controllers/expense.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

router.route("/").post(verifyJWT, addExpense);
router.route("/:id").delete(verifyJWT, deleteExpense);

export default router;
