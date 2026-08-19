import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";

import {
  create,
  getActive,
  update,
  changeStock,
} from "../controllers/product.controller";

const router = Router();

/*
 * CUSTOMER + ADMIN
 * View active products
 */
router.get("/", authenticate, getActive);

/*
 * ADMIN
 * Create product
 */
router.post("/", authenticate, authorize("ADMIN"), create);

/*
 * ADMIN
 * Update product details
 */
router.patch("/:id", authenticate, authorize("ADMIN"), update);

/*
 * ADMIN
 * Change stock
 */
router.patch("/:id/stock", authenticate, authorize("ADMIN"), changeStock);

export default router;
