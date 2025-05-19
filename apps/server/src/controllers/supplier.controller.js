import Supplier from "../models/Supplier.model";
import { asyncHandler } from "../utils/asyncHandler";
import { ApiError } from "../utils/ApiError";
import { ApiResponse } from "../utils/ApiResponse";

//create supplier
// Create a new supplier
const createSupplier = asyncHandler(async (req, res) => {
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
const getAllSuppliers = asyncHandler(async (req, res) => {
  const suppliers = await Supplier.find();
  if (!suppliers || suppliers.length < 1) {
    throw new ApiError(404, "suppliers not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, suppliers, "Suppliers fetched successfully"));
});

export { createSupplier, getAllSuppliers };
