import Distributor from "../models/Distributor.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";

//create distributor
// Create a new distributor
const createDistributor = asyncHandler(async (req, res) => {
  // imp clg
  // console.log("body", req.body, "user", req.user);
  const { name, gstin, address, phone, email, contactPerson, company } =
    req.body;

  // Validate required fields
  if (!name) {
    throw new ApiError(400, "Distributor name is required");
  }

  // Get createdBy from the authenticated user (set by verifyJWT middleware)
  const createdBy = req.user?._id;
  if (!createdBy) {
    throw new ApiError(401, "User not authenticated");
  }

  // Create the distributor
  const distributor = await Distributor.create({
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
    .json(new ApiResponse(201, distributor, "Distrbutor created successfully"));
});

// Get all distributors
const getAllDistributors = asyncHandler(async (req, res) => {
  const distributors = await Distributor.find();
  if (!distributors || distributors.length < 1) {
    throw new ApiError(404, "distributors not found");
  }
  return res
    .status(200)
    .json(
      new ApiResponse(200, distributors, "Distributors fetched successfully")
    );
});

// Get distributorById
const getDistributorById = asyncHandler(async (req, res) => {
  // console.log("req from getDistById", req);
  const { id } = req.params;

  const distributor = await Distributor.findById(id);

  if (!distributor) {
    throw new ApiError(404, "Distributor not found");
  }

  return res.status(200).json(new ApiResponse(200, distributor));
});

// Update Distributor By Id
const updateDistributorById = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const distributor = await Distributor.findByIdAndUpdate(id, updates, {
    new: true,
    runValidators: true,
  });

  if (!distributor) {
    throw new ApiError(404, "Distributor not found");
  }

  return res
    .status(200)
    .json(
      new ApiResponse(200, distributor, "Distributor updated successfully")
    );
});

// Delete Distributor by id
const deleteDistributorById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const distributor = await Distributor.findByIdAndDelete(id);

  if (!distributor) {
    throw new ApiError(404, "Distributor not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Distributor deleted successfully"));
});

export {
  createDistributor,
  getAllDistributors,
  getDistributorById,
  updateDistributorById,
  deleteDistributorById,
};
