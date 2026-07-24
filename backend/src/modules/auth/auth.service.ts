import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import prisma from '@/lib/prisma';
import { LoginInput, RegisterInput } from '@app/validations';

export const register = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw createError(400, 'User already exists');

  const password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { ...data },
  });

  return { id: user.id, email: user.email };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw createError(401, 'Invalid credentials');

  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw createError(401, 'Invalid credentials');

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET || 'secret', {
    expiresIn: (process.env.JWT_EXPIRES_IN as any) || '1d',
  });

  return { token, user: { id: user.id, email: user.email } };
};
