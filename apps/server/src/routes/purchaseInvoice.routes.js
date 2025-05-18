import express from "express";
import {
  createPurchaseInvoice,
  getAllPurchaseInvoices,
  getPurchaseInvoiceById,
} from "../controllers/purchaseInvoice.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = express.Router();

// Secure all routes with verifyJWT middleware
router.use(verifyJWT);

router
  .route("/")
  .post(createPurchaseInvoice) // Create new purchase invoice
  .get(getAllPurchaseInvoices); // Get all purchase invoices

router.route("/:id").get(getPurchaseInvoiceById); // Get a specific purchase invoice

export default router;
