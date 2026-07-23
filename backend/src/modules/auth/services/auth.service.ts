import crypto from "crypto";
import bcrypt from "bcrypt";
import { UAParser } from "ua-parser-js";
import {
  generateAccessToken, generateRefreshToken,
  verifyRefreshToken, daysToMs,
} from "../../../utils/jwt.js";
import { AuthRepository } from "../repositories/auth.repository.js";
import { MailService } from "../../mail/services/mail.service.js";
import createHttpError from "http-errors";
import redis from "../../../config/redis.js";
import type { IAuthResponse, DeviceInfo, OtpSession, ResetSession, UserType } from "../types/index.js";

const OTP_PREFIX   = "reset-session:";
const RESET_PREFIX = "reset-password-session:";
const OTP_TTL      = 600;   // 10 min
const RESET_TTL    = 900;   // 15 min
const PROFILE_PREFIX = "user:profile:";
const PROFILE_TTL    = 300; // 5 min

export class AuthService {
  // ─── Login ──────────────────────────────────────────────────────────────────
  static async login(email: string, password: string, deviceInfo?: DeviceInfo): Promise<IAuthResponse> {
    const user = await AuthRepository.findUserByEmail(email);
    if (!user) throw new createHttpError.Unauthorized("Invalid credentials.");

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) throw new createHttpError.Unauthorized("Invalid credentials.");

    return AuthService.createTokenResponse(user, deviceInfo);
  }

  // ─── Register ───────────────────────────────────────────────────────────────
  static async register(data: { email: string; password: string; roleName: string }) {
    const existing = await AuthRepository.findUserByEmail(data.email);
    if (existing) throw new createHttpError.Conflict("Email is already in use.");

    const role = await AuthRepository.findRoleByName(data.roleName);
    if (!role) throw new createHttpError.NotFound(`Role "${data.roleName}" not found.`);

    const hashedPassword = await bcrypt.hash(data.password, 10);
    await AuthRepository.createUser({
      email: data.email,
      hashedPassword,
      roleId: role.id,
      userType: "PERSONAL" as UserType,
    });

    return { success: true, message: "User registered successfully." };
  }

  // ─── Forgot Password ────────────────────────────────────────────────────────
  static async forgotPassword(email: string) {
    const user = await AuthRepository.findUserByEmail(email);
    // Prevent email enumeration
    if (!user) {
      return { success: true, message: "If the email exists, an OTP will be sent.", sessionId: crypto.randomBytes(16).toString("hex") };
    }

    const otp = AuthService.generateOtp();
    const sessionId = crypto.randomBytes(16).toString("hex");
    const payload: OtpSession = { userId: user.id, email: user.email, otp };
    await redis.set(`${OTP_PREFIX}${sessionId}`, JSON.stringify(payload), "EX", OTP_TTL);

    const sent = await MailService.sendForgotPasswordOtp(email, otp);
    if (!sent) {
      await redis.del(`${OTP_PREFIX}${sessionId}`);
      throw new createHttpError.InternalServerError("Failed to send OTP email.");
    }

    return { success: true, message: "If the email exists, an OTP will be sent.", sessionId };
  }

  // ─── Verify OTP ─────────────────────────────────────────────────────────────
  static async verifyForgotPasswordOtp(sessionId: string, otp: string) {
    const raw = await redis.get(`${OTP_PREFIX}${sessionId}`);
    if (!raw) throw new createHttpError.BadRequest("Session expired. Please request a new OTP.");

    const session: OtpSession = JSON.parse(raw);
    if (session.otp !== otp) throw new createHttpError.BadRequest("Invalid OTP.");

    await redis.del(`${OTP_PREFIX}${sessionId}`);

    const resetId = crypto.randomBytes(16).toString("hex");
    const resetPayload: ResetSession = { userId: session.userId, email: session.email };
    await redis.set(`${RESET_PREFIX}${resetId}`, JSON.stringify(resetPayload), "EX", RESET_TTL);

    return { success: true, message: "OTP verified.", resetSessionId: resetId };
  }

  // ─── Reset Password ─────────────────────────────────────────────────────────
  static async resetPassword(sessionId: string, newPassword: string) {
    const raw = await redis.get(`${RESET_PREFIX}${sessionId}`);
    if (!raw) throw new createHttpError.BadRequest("Reset session expired. Please verify OTP again.");

    const session: ResetSession = JSON.parse(raw);
    const hashed = await bcrypt.hash(newPassword, 10);
    await AuthRepository.updateUserPassword(session.email, hashed);
    await redis.del(`${RESET_PREFIX}${sessionId}`);

    return { success: true, message: "Password reset successfully." };
  }

  // ─── Get Me ─────────────────────────────────────────────────────────────────
  static async getMe(userId: number) {
    const cacheKey = `${PROFILE_PREFIX}${userId}`;
    const cached = await redis.get(cacheKey);
    if (cached) return JSON.parse(cached);

    const user = await AuthRepository.findUserWithRoleById(userId);
    if (!user) throw new createHttpError.NotFound("User not found.");

    const { password, ...safe } = user;
    await redis.set(cacheKey, JSON.stringify(safe), "EX", PROFILE_TTL);
    return safe;
  }

  // ─── Get Roles ───────────────────────────────────────────────────────────────
  static async getRoles() { return AuthRepository.getRoles(); }

  // ─── Refresh Token ───────────────────────────────────────────────────────────
  static async refreshToken(token: string, deviceInfo?: DeviceInfo): Promise<IAuthResponse> {
    if (!token) throw new createHttpError.Unauthorized("Refresh token required.");
    try {
      const decoded = verifyRefreshToken(token);
      const existing = await AuthRepository.findRefreshToken(token);
      if (!existing || existing.expiresAt <= new Date()) {
        throw new createHttpError.Unauthorized("Invalid refresh token.");
      }
      const user = await AuthRepository.findUserById(parseInt(decoded.id));
      if (!user) throw new createHttpError.Unauthorized("User not found.");

      const accessToken = generateAccessToken({ id: user.id.toString(), userType: user.userType as UserType });
      return { accessToken, refreshToken: token, user: { id: user.id, email: user.email, userType: user.userType as UserType } };
    } catch (err) {
      if (err instanceof createHttpError.HttpError) throw err;
      throw new createHttpError.Unauthorized("Invalid refresh token.");
    }
  }

  // ─── Logout ─────────────────────────────────────────────────────────────────
  static async logout(token?: string) {
    if (token) await AuthRepository.deleteRefreshToken(token);
    return { success: true, message: "Logged out successfully." };
  }

  // ─── Helpers ─────────────────────────────────────────────────────────────────
  static async createTokenResponse(
    user: { id: number; email: string; userType: string },
    deviceInfo?: DeviceInfo,
  ): Promise<IAuthResponse> {
    const accessToken  = generateAccessToken({ id: user.id.toString(), userType: user.userType as UserType });
    const refreshToken = generateRefreshToken({ id: user.id.toString() });
    await AuthRepository.createRefreshToken(
      refreshToken, user.id,
      new Date(Date.now() + daysToMs(7)),
      deviceInfo,
    );
    return { accessToken, refreshToken, user: { id: user.id, email: user.email, userType: user.userType as UserType } };
  }

  static getDeviceInfo(userAgent?: string, ipAddress?: string): DeviceInfo {
    const parser = new UAParser(userAgent);
    const result = parser.getResult();
    return {
      userAgent: userAgent ?? "unknown",
      ipAddress: ipAddress ?? "unknown",
      browser: result.browser.name ?? "unknown",
      os: result.os.name ?? "unknown",
      device: result.device.type ?? "desktop",
    };
  }

  private static generateOtp(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }
}
