import { Router } from "express";
import * as userController from "../conrtoller/user.controller";
import { verifyAccessToken } from "@/middlewares/checkAuth";
import { can } from "@/middlewares/checkPermission";

const route = Router();

// Public invitation acceptance
route.post("/accept-invitation", [], userController.acceptInvitation);

// Authenticated user management routes
route.get("/", [verifyAccessToken, can("users", "list")], userController.index);
route.post("/invite", [verifyAccessToken, can("users", "create")], userController.invite);
route.post("/disable/:id", [verifyAccessToken, can("users", "update")], userController.disable);
route.post("/enable/:id", [verifyAccessToken, can("users", "update")], userController.enable);
route.delete("/:id", [verifyAccessToken, can("users", "delete")], userController.destroy);
route.post("/restore/:id", [verifyAccessToken, can("users", "delete")], userController.restore);
route.put("/:id", [verifyAccessToken, can("users", "update")], userController.update);
route.post("/resend-invite/:id", [verifyAccessToken, can("users", "update")], userController.resendInvite);
route.post("/reset-password/:id", [verifyAccessToken, can("users", "update")], userController.sendResetPasswordLink);

export default route;
