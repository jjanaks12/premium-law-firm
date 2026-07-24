import * as yup from 'yup';

export const registerSchema = yup.object({
  first_name: yup.string().required(),
  last_name: yup.string().required(),
  email: yup.string().email().required(),
  password: yup.string().min(6).required(),
});

export const loginSchema = yup.object({
  email: yup.string().email().required(),
  password: yup.string().required(),
  remember: yup.boolean()
});

export const forgotPasswordSchema = yup.object({
  email: yup.string().email().required(),
});

export const resetPasswordSchema = yup.object({
  token: yup.string().required(),
  password: yup.string().min(6).required(),
});

export type RegisterInput = yup.InferType<typeof registerSchema>;
export type LoginInput = yup.InferType<typeof loginSchema>;
export type ForgotPasswordInput = yup.InferType<typeof forgotPasswordSchema>;
export type ResetPasswordInput = yup.InferType<typeof resetPasswordSchema>;
