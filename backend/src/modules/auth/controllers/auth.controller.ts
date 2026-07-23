import type { Request, Response } from "express";
import { AuthService } from "../services/auth.service.js";
import { StatusCodes } from "../../../constants/statusCode.js";
import { env } from "../../../config/env.js";

const isProd = env.NODE_ENV === "production";
const cookieOpts = { httpOnly: true, secure: isProd, sameSite: "lax" as const };

export class AuthController {
  static async login(req: Request, res: Response) {
    const deviceInfo = AuthService.getDeviceInfo(req.headers["user-agent"], req.ip);
    const result = await AuthService.login(req.body.email, req.body.password, deviceInfo);

    res.cookie("refreshToken", result.refreshToken, { ...cookieOpts, maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.cookie("accessToken", result.accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });

    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Login successful.", data: { user: result.user } });
  }

  static async register(req: Request, res: Response) {
    const response = await AuthService.register(req.body);
    res.status(StatusCodes.CREATED).json(response);
  }

  static async forgotPassword(req: Request, res: Response) {
    const response = await AuthService.forgotPassword(req.body.email);
    res.status(StatusCodes.SUCCESS).json(response);
  }

  static async verifyOtp(req: Request, res: Response) {
    const response = await AuthService.verifyForgotPasswordOtp(req.params.sessionId, req.body.otp);
    res.status(StatusCodes.SUCCESS).json(response);
  }

  static async resetPassword(req: Request, res: Response) {
    const response = await AuthService.resetPassword(req.params.sessionId, req.body.newPassword);
    res.status(StatusCodes.SUCCESS).json(response);
  }

  static async getMe(req: Request, res: Response) {
    const user = await AuthService.getMe(parseInt(req.user.id));
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "User fetched successfully.", data: user });
  }

  static async getRoles(_req: Request, res: Response) {
    const data = await AuthService.getRoles();
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Roles fetched.", data });
  }

  static async refreshToken(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    const deviceInfo = AuthService.getDeviceInfo(req.headers["user-agent"], req.ip);
    const result = await AuthService.refreshToken(token, deviceInfo);
    res.cookie("accessToken", result.accessToken, { ...cookieOpts, maxAge: 15 * 60 * 1000 });
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Token refreshed.", data: { user: result.user } });
  }

  static async logout(req: Request, res: Response) {
    const token = req.cookies?.refreshToken;
    const response = await AuthService.logout(token);
    res.clearCookie("refreshToken", cookieOpts);
    res.clearCookie("accessToken", cookieOpts);
    res.status(StatusCodes.SUCCESS).json(response);
  }
}
