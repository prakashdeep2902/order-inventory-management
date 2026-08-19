import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth.middleware";

import { create } from "../controllers/order.controller";

const router = Router();

router.post("/", authenticate, authorize("CUSTOMER"), create);

export default router;
