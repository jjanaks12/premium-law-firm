import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { validateRequest } from "../../../middlewares/validate/validateRequest.middleware.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import authMiddleware from "../../../middlewares/auth/authentication.middleware.js";
import {
  loginODT, registerODT, forgotPasswordODT, verifyOtpODT, resetPasswordODT,
} from "../validators/auth.validator.js";

const router = Router();

router.post("/login", validateRequest(loginODT), catchAsync(AuthController.login));
router.post("/register", validateRequest(registerODT), catchAsync(AuthController.register));
router.post("/forgot-password", validateRequest(forgotPasswordODT), catchAsync(AuthController.forgotPassword));
router.post("/verify-otp/:sessionId", validateRequest(verifyOtpODT), catchAsync(AuthController.verifyOtp));
router.post("/reset-password/:sessionId", validateRequest(resetPasswordODT), catchAsync(AuthController.resetPassword));
router.post("/refresh-token", catchAsync(AuthController.refreshToken));
router.post("/logout", catchAsync(AuthController.logout));
router.get("/roles", catchAsync(AuthController.getRoles));
router.get("/me", authMiddleware(), catchAsync(AuthController.getMe));

export default router;
