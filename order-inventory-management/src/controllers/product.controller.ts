import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import {
  createProduct,
  getActiveProducts,
  updateProduct,
  updateStock,
} from "../services/product.service";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    const { name, price, stock } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "Name, price and stock are required",
      });
    }

    if (price < 0 || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Price and stock cannot be negative",
      });
    }

    const product = await createProduct(name, Number(price), Number(stock));

    return res.status(201).json({
      success: true,
      data: product,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const getActive = async (req: AuthRequest, res: Response) => {
  try {
    const products = await getActiveProducts();

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    const { name, price, active } = req.body;

    if (price !== undefined && (typeof price !== "number" || price < 0)) {
      return res.status(400).json({
        success: false,
        message: "Invalid price",
      });
    }

    const product = await updateProduct(productId, {
      name,
      price,
      active,
    });

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export const changeStock = async (req: AuthRequest, res: Response) => {
  try {
    const productId = Number(req.params.id);
    const { stock } = req.body;

    if (Number.isNaN(productId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid product ID",
      });
    }

    if (stock === undefined || !Number.isInteger(stock) || stock < 0) {
      return res.status(400).json({
        success: false,
        message: "Stock must be a non-negative integer",
      });
    }

    const product = await updateStock(productId, stock);

    return res.status(200).json({
      success: true,
      data: product,
    });
  } catch (error: any) {
    if (error.message === "PRODUCT_NOT_FOUND") {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
