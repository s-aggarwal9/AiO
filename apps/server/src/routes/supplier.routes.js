import {
  getAllSuppliers,
  createSupplier,
} from "../controllers/supplier.controller";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware";

const router = Router();

// Secure all routes with verifyJWT middleware
router.use(verifyJWT);

router
  .route("/")
  .post(createSupplier) // Create new supplier
  .get(getAllSuppliers); // Get all suppliers

router.route("/:id").get(getPurchaseInvoiceById); // Get a specific purchase invoice

export default router;
