import Product from "../models/Product.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";

//create product
const createProduct = asyncHandler(async (req, res) => {
  const {
    name,
    barcode,
    category,
    distributor,
    stock,
    costPrice,
    mrp,
    sellingPrice,
    batchNo,
    mfgDate,
    expiryDate,
  } = req.body;

  // Basic validation
  if (
    !name ||
    !barcode ||
    !category ||
    !distributor ||
    !stock ||
    !costPrice ||
    !mrp
  ) {
    throw new ApiError(400, "Required fields missing");
  }

  // Upload image if present
  let imageUrl = null;
  if (req.file?.path) {
    const cloudinaryResponse = await uploadOnCloudinary(req.file.path);
    if (!cloudinaryResponse) {
      throw new ApiError(500, "Image upload failed");
    }
    imageUrl = cloudinaryResponse.secure_url;
  }

  // Create product
  const product = await Product.create({
    name,
    barcode,
    category,
    distributor,
    stock,
    costPrice,
    mrp,
    sellingPrice: sellingPrice || mrp,
    batchNo,
    mfgDate,
    expiryDate,
    image: imageUrl,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, product, "Product created successfully"));
});

// Get all products
const getAllProducts = asyncHandler(async (req, res) => {
  const products = await Product.find();
  return res
    .status(200)
    .json(new ApiResponse(200, products, "All products fetched"));
});

// Get a single product
const getProductById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findById(id);
  if (!product) throw new ApiError(404, "Product not found");

  return res.status(200).json(new ApiResponse(200, product, "Product fetched"));
});

// GET PRODUCTS BY CATEGORY
const getProductsByCategory = asyncHandler(async (req, res) => {
  const { category } = req.params;
  const products = await Product.find({ category });
  return res.status(200).json(new ApiResponse(200, products));
});

// GET PRODUCTS BY DISTRIBUTOR
const getProductsByDistributor = asyncHandler(async (req, res) => {
  const { distributor } = req.params;
  const products = await Product.find({ distributor });
  return res.status(200).json(new ApiResponse(200, products));
});

// SEARCH PRODUCTS BY NAME
const searchProductsByName = asyncHandler(async (req, res) => {
  const { name } = req.query;
  if (!name) throw new ApiError(400, "Search query is required");

  const products = await Product.find({
    name: { $regex: name, $options: "i" },
  });

  return res.status(200).json(new ApiResponse(200, products));
});

// Update a product
const updateProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const updatedData = {
    ...req.body,
    productImage: req.file?.path || undefined,
  };

  const product = await Product.findByIdAndUpdate(id, updatedData, {
    new: true,
    runValidators: true,
  });

  if (!product) throw new ApiError(404, "Product not found");

  return res
    .status(200)
    .json(new ApiResponse(200, product, "Product updated successfully"));
});

// Delete a product
const deleteProduct = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const product = await Product.findByIdAndDelete(id);
  if (!product) throw new ApiError(404, "Product not found");

  return res
    .status(200)
    .json(new ApiResponse(200, null, "Product deleted successfully"));
});

export {
  createProduct,
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByDistributor,
  searchProductsByName,
  updateProduct,
  deleteProduct,
};
