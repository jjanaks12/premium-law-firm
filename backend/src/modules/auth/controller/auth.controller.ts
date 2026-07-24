import { Request, Response } from 'express';
import * as authService from '../auth.service';
import { loginSchema, registerSchema } from '@app/validations';

export const register = async (req: Request, res: Response) => {
  const requestBody = await registerSchema.validate(req.body, { abortEarly: false });
  const result = await authService.register(requestBody);
  res.status(201).json({ success: true, data: result });
};

export const login = async (req: Request, res: Response) => {
  const requestBody = await loginSchema.validate(req.body, { abortEarly: false });
  console.log(requestBody)
  const result = await authService.login(requestBody);
  res.json({ success: true, data: result });
};
