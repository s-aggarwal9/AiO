import { Router } from "express";
import { verifyJWT } from "../middlewares/auth.middleware.js";
import {
  createDistributor,
  deleteDistributorById,
  getAllDistributors,
  getDistributorById,
  updateDistributorById,
} from "../controllers/distributor.controller.js";

const router = Router();

// Secure all routes with verifyJWT middleware
router.use(verifyJWT);

router
  .route("/")
  .post(createDistributor) // Create new supplier
  .get(getAllDistributors); // Get all suppliers

router
  .route("/:id")
  .get(getDistributorById)
  .put(updateDistributorById)
  .delete(deleteDistributorById);

export default router;
