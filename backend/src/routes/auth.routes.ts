import { Router } from "express";
import * as authController from "../controllers/auth.controller";
import { requireAuth } from "../middlewares/auth.middleware";
import { authLimiter } from "../middlewares/rateLimiter.middleware";
import { validateMiddleware } from "../middlewares/validate.middleware";
import { uploadSingle } from "../middlewares/upload.middleware";
import { loginValidator, changePasswordValidator, updateOwnProfileValidator } from "../validators/auth.validators";

const router = Router();

router.post("/login", authLimiter, loginValidator, validateMiddleware, authController.login);
router.post("/refresh", authLimiter, authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.post("/logout-all", requireAuth, authController.logoutAll);
router.post(
  "/change-password",
  requireAuth,
  changePasswordValidator,
  validateMiddleware,
  authController.changePassword,
);
router.get("/me", requireAuth, authController.me);
router.patch("/me", requireAuth, updateOwnProfileValidator, validateMiddleware, authController.updateOwnProfile);
router.patch("/me/avatar", requireAuth, uploadSingle("staff", "avatar"), authController.updateOwnAvatar);

export default router;
