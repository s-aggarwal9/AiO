import {
  getAllDistributors,
  createDistributor,
  deleteDistributorById,
  getDistributorById,
} from "../controllers/supplier.controller.js";
import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";

const router = Router();

// Secure all routes with verifyJWT middleware
router.use(verifyJWT);

router
  .route("/")
  .post(createDistributor) // Create new supplier
  .get(getAllDistributors); // Get all suppliers

router.route("/:id").get(getDistributorById).delete(deleteDistributorById);

export default router;
