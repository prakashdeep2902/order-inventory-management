import { Response } from "express";
import { AuthRequest } from "../middleware/auth.middleware";
import { createOrder } from "../services/order.service";

export const create = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Authentication required",
      });
    }

    const idempotencyKey = req.headers["idempotency-key"];

    if (typeof idempotencyKey !== "string" || !idempotencyKey.trim()) {
      return res.status(400).json({
        success: false,
        message: "Idempotency-Key header is required",
      });
    }

    const { items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Order must contain at least one item",
      });
    }

    const result = await createOrder(req.user.userId, idempotencyKey, items);

    if (result.type === "EXISTING_ORDER") {
      return res.status(200).json({
        success: true,
        message: "Order already exists",
        data: result.order,
      });
    }

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: result.order,
    });
  } catch (error: any) {
    switch (error.message) {
      case "DUPLICATE_PRODUCT":
        return res.status(400).json({
          success: false,
          message: "Duplicate product in order",
        });

      case "PRODUCT_NOT_FOUND":
        return res.status(404).json({
          success: false,
          message: "Product not found",
        });

      case "INVALID_QUANTITY":
        return res.status(400).json({
          success: false,
          message: "Quantity must be a positive integer",
        });

      case "PRODUCT_INACTIVE":
        return res.status(400).json({
          success: false,
          message: "Product is inactive",
        });

      case "INSUFFICIENT_STOCK":
        return res.status(409).json({
          success: false,
          message: "Insufficient stock",
        });
      case "IDEMPOTENCY_CONFLICT":
        return res.status(409).json({
          success: false,
          message:
            "Idempotency key has already been used with a different request",
        });

      default:
        console.error(error);

        return res.status(500).json({
          success: false,
          message: "Internal server error",
        });
    }
  }
};
