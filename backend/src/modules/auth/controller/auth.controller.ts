import { Request, Response } from 'express';
import * as authService from '../auth.service';
import { loginSchema, registerSchema, forgotPasswordSchema, resetPasswordSchema } from '@app/validations';
import createHttpError from 'http-errors';

export const register = async (req: Request, res: Response) => {
  const requestBody = await registerSchema.validate(req.body, { abortEarly: false });
  const result = await authService.register(requestBody);
  res.status(201).json({ success: true, data: result });
};

export const login = async (req: Request, res: Response) => {
  const requestBody = await loginSchema.validate(req.body, { abortEarly: false });
  const result = await authService.login(requestBody);
  res.json({ success: true, data: result });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: tokenStr } = req.body;
  if (!tokenStr) {
    throw createHttpError.BadRequest('Refresh token is required');
  }
  const result = await authService.refreshToken(tokenStr);
  res.json({ success: true, data: result });
};

export const logout = async (req: Request, res: Response) => {
  const { refreshToken: tokenStr } = req.body;
  if (!tokenStr) {
    throw createHttpError.BadRequest('Refresh token is required');
  }
  await authService.logout(tokenStr);
  res.json({ success: true, message: 'Logged out successfully' });
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = await forgotPasswordSchema.validate(req.body, { abortEarly: false });
  const result = await authService.forgotPassword(email);
  res.json(result);
};

export const resetPassword = async (req: Request, res: Response) => {
  const { token, password } = await resetPasswordSchema.validate(req.body, { abortEarly: false });
  const result = await authService.resetPassword(token, password);
  res.json(result);
};
