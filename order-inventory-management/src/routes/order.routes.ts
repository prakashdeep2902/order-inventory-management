import { Router } from "express";

import { authenticate, authorize } from "../middleware/auth.middleware";

import {
  create,
  getMine,
  getMineById,
  getAll,
} from "../controllers/order.controller";

const router = Router();

// CUSTOMER - create order
router.post("/", authenticate, authorize("CUSTOMER"), create);

// CUSTOMER - own orders
router.get("/my", authenticate, authorize("CUSTOMER"), getMine);

// CUSTOMER - one own order
router.get("/my/:id", authenticate, authorize("CUSTOMER"), getMineById);

// ADMIN - all orders
router.get("/", authenticate, authorize("ADMIN"), getAll);

export default router;
