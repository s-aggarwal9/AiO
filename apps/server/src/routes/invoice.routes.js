import { Router } from "express";
import {
  createInvoice,
  getAllInvoices,
  getInvoiceById,
  getInvoicePDF,
  updateInvoice,
  deleteInvoice,
} from "../controllers/invoice.controller.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

// Protect all invoice routes with authentication middleware
router.use(verifyJWT);

router.route("/").post(createInvoice).get(getAllInvoices);

router
  .route("/:id")
  .get(getInvoiceById)
  .put(updateInvoice)
  .delete(deleteInvoice);

router.route("/:id/pdf").get(getInvoicePDF);

export default router;
