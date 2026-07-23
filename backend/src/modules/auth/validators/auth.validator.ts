import { z } from "zod";

export const loginODT = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export const registerODT = z.object({
  email: z.string().email("Invalid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  roleName: z.string().min(1, "Role name is required"),
});

export const forgotPasswordODT = z.object({
  email: z.string().email("Invalid email"),
});

export const verifyOtpODT = z.object({
  otp: z.string().length(6, "OTP must be 6 digits"),
});

export const resetPasswordODT = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters"),
});
