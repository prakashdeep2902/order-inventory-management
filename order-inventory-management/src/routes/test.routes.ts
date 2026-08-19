import { Router } from "express";
import {
  authenticate,
  authorize,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.get("/profile", authenticate, (req: AuthRequest, res) => {
  res.json({
    success: true,
    message: "Authenticated successfully",
    user: req.user,
  });
});

router.get(
  "/admin",
  authenticate,
  authorize("ADMIN"),
  (req: AuthRequest, res) => {
    res.json({
      success: true,
      message: "Admin access granted",
      user: req.user,
    });
  },
);

export default router;
