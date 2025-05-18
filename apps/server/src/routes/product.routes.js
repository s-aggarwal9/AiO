import { Router } from "express";
import {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByDistributor,
  searchProductsByName,
  updateProduct,
  deleteProduct,
} from "../controllers/product.controller.js";

import { uploadSingleAttachment } from "../middlewares/multer.middleware.js";
import { verifyJWT } from "../middlewares/verifyJWT.js";

const router = Router();

// Public access routes
router.get("/", getAllProducts);
router.get("/search", searchProductsByName);
router.get("/category/:category", getProductsByCategory);
router.get("/distributor/:distributor", getProductsByDistributor);
router.get("/:id", getProductById);

// Protected (admin/manager) routes
router.post("/create", verifyJWT, uploadSingleAttachment, createProduct);
router.put("/:id", verifyJWT, uploadSingleAttachment, updateProduct);
router.delete("/:id", verifyJWT, deleteProduct);

export default router;
