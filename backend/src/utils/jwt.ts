import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { IJwtPayload, IRefreshTokenPayload } from "../interfaces/jwt.interface.js";
import { UserType } from "../modules/auth/types/index.js";
import createHttpError from "http-errors";

export const generateAccessToken = (payload: { id: string; userType: UserType }) =>
  jwt.sign(payload, env.JWT_SECRET, { expiresIn: "15m" });

export const generateRefreshToken = (payload: { id: string }) =>
  jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: "7d" });

export const verifyAccessToken = (token: string): IJwtPayload => {
  const decoded = jwt.verify(token, env.JWT_SECRET);
  if (typeof decoded !== "object" || !("id" in decoded) || !("userType" in decoded)) {
    throw createHttpError.Unauthorized("Invalid token payload");
  }
  return decoded as IJwtPayload;
};

export const verifyRefreshToken = (token: string): IRefreshTokenPayload => {
  const decoded = jwt.verify(token, env.JWT_REFRESH_SECRET);
  if (typeof decoded !== "object" || !("id" in decoded)) {
    throw createHttpError.Unauthorized("Invalid refresh token payload");
  }
  return decoded as IRefreshTokenPayload;
};

export const daysToMs = (days: number) => days * 24 * 60 * 60 * 1000;
