import {
  getAllSuppliers,
  createSupplier,
} from "../controllers/supplier.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all routes with verifyJWT middleware
router.use(verifyJWT);

router
  .route("/")
  .post(createSupplier) // Create new supplier
  .get(getAllSuppliers); // Get all suppliers

// router.route("/:id").get(getSupplierById); baad mein karta hoon

export default router;
