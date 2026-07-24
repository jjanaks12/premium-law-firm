import { Router } from "express";
import * as userController from "./user.controller";
import { verifyAccessToken } from "@/middlewares/checkAuth";

const route = Router();

// Public invitation acceptance
route.post("/accept-invitation", [], userController.acceptInvitation);

// Authenticated user management routes
route.get("/", [verifyAccessToken], userController.index);
route.post("/invite", [verifyAccessToken], userController.invite);
route.post("/disable/:id", [verifyAccessToken], userController.disable);
route.post("/enable/:id", [verifyAccessToken], userController.enable);
route.delete("/:id", [verifyAccessToken], userController.destroy);
route.post("/restore/:id", [verifyAccessToken], userController.restore);
route.put("/:id", [verifyAccessToken], userController.update);
route.post("/resend-invite/:id", [verifyAccessToken], userController.resendInvite);
route.post("/reset-password/:id", [verifyAccessToken], userController.sendResetPasswordLink);

export default route;
