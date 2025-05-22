import { getSalesReport } from "../controllers/report.controller.js";
import { verifyJWT } from "../middlewares/auth.middleware.js";

import { Router } from "express";

const router = Router();

// protected routes
router.route("/sales-report").get(verifyJWT, getSalesReport);

export default router;
