import Supplier from "../models/Supplier.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//create supplier
// Create a new supplier
const createDistributor = asyncHandler(async (req, res) => {
  // imp clg
  // console.log("body", req.body, "user", req.user);
  const { name, gstin, address, phone, email, contactPerson, company } =
    req.body;

  // Validate required fields
  if (!name) {
    throw new ApiError(400, "Supplier name is required");
  }

  // Get createdBy from the authenticated user (set by verifyJWT middleware)
  const createdBy = req.user?._id;
  if (!createdBy) {
    throw new ApiError(401, "User not authenticated");
  }

  // Create the supplier
  const supplier = await Supplier.create({
    name,
    gstin,
    address,
    phone,
    email,
    contactPerson,
    createdBy,
    company,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, supplier, "Supplier created successfully"));
});

// Get all suppliers
const getAllDistributors = asyncHandler(async (req, res) => {
  const distributors = await Supplier.find();
  if (!distributors || distributors.length < 1) {
    throw new ApiError(404, "suppliers not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, distributors, "Suppliers fetched successfully"));
});

export { createDistributor, getAllDistributors };
