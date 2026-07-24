import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import prisma from '@/lib/prisma';
import { LoginInput, RegisterInput } from '@app/validations';
import { queueEmail } from '../notifications/notification.queue';
import { renderEmailTemplate } from '../notifications/services/emailTemplates';
import crypto from 'crypto';
import createHttpError from 'http-errors';

const ACCESS_TOKEN_SECRET = process.env.ACCESS_TOKEN_SECRET || 'access_secret';
const REFRESH_TOKEN_SECRET = process.env.REFRESH_TOKEN_SECRET || 'refresh_secret';
const CLIENT_URL = (process.env.CLIENT_URL || 'http://localhost:3000').split(',')[0];

export const register = async (data: RegisterInput) => {
  const existing = await prisma.user.findUnique({ where: { email: data.email } });
  if (existing) throw createError(400, 'User already exists');

  const password = await bcrypt.hash(data.password, 10);
  const user = await prisma.user.create({
    data: { ...data, password },
  });

  return { id: user.id, email: user.email };
};

export const login = async (data: LoginInput) => {
  const user = await prisma.user.findUnique({ where: { email: data.email } });
  if (!user) throw createError(401, 'Invalid credentials');

  const match = await bcrypt.compare(data.password, user.password);
  if (!match) throw createError(401, 'Invalid credentials');

  const accessToken = jwt.sign({}, ACCESS_TOKEN_SECRET, {
    audience: user.id,
    expiresIn: '15m',
  });

  const refreshTokenStr = jwt.sign({}, REFRESH_TOKEN_SECRET, {
    audience: user.id,
    expiresIn: '7d',
  });

  // Save the refresh token to the database
  await prisma.refreshToken.create({
    data: {
      token: refreshTokenStr,
      user_id: user.id,
      expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    },
  });

  return {
    accessToken,
    refreshToken: refreshTokenStr,
    user: { id: user.id, email: user.email, first_name: user.first_name, last_name: user.last_name },
  };
};

export const refreshToken = async (tokenStr: string) => {
  try {
    const payload = jwt.verify(tokenStr, REFRESH_TOKEN_SECRET) as jwt.JwtPayload;
    const userId = payload.aud;
    if (!userId || typeof userId !== 'string') {
      throw createError(401, 'Invalid refresh token');
    }

    // Check if token exists in db
    const dbToken = await prisma.refreshToken.findUnique({
      where: { token: tokenStr },
    });
    if (!dbToken || dbToken.expires_at < new Date()) {
      if (dbToken) {
        await prisma.refreshToken.delete({ where: { token: tokenStr } });
      }
      throw createError(401, 'Refresh token expired or invalid');
    }

    // Generate new access and refresh tokens (token rotation)
    const newAccessToken = jwt.sign({}, ACCESS_TOKEN_SECRET, {
      audience: userId,
      expiresIn: '15m',
    });

    const newRefreshTokenStr = jwt.sign({}, REFRESH_TOKEN_SECRET, {
      audience: userId,
      expiresIn: '7d',
    });

    // Delete old refresh token and save the new one
    await prisma.refreshToken.delete({ where: { token: tokenStr } });
    await prisma.refreshToken.create({
      data: {
        token: newRefreshTokenStr,
        user_id: userId,
        expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshTokenStr,
    };
  } catch (error) {
    throw createError(401, 'Invalid or expired refresh token');
  }
};

export const logout = async (tokenStr: string) => {
  try {
    await prisma.refreshToken.delete({
      where: { token: tokenStr },
    });
  } catch (error) {
    // If token doesn't exist, we can ignore or return success since they are logged out anyway
  }
  return { success: true };
};

export const forgotPassword = async (email: string, locale?: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw createHttpError.NotFound('User does not exists.')
  }

  // Generate a random token
  const resetToken = crypto.randomBytes(32).toString('hex');
  const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');

  // Save the reset token
  await prisma.passwordResetToken.create({
    data: {
      token: hashedToken,
      user_id: user.id,
      expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
    },
  });

  let localePath = '';
  if (locale) {
    const primaryLocale = locale.split(',')[0].split('-')[0].trim().toLowerCase();
    if (['en', 'np'].includes(primaryLocale)) {
      localePath = `/${primaryLocale}`;
    }
  }

  const resetUrl = `${CLIENT_URL}${localePath}/reset-password?token=${resetToken}`;
  const htmlContent = renderEmailTemplate('forgotPassword', {
    name: `${user.first_name} ${user.last_name}`,
    resetUrl
  });

  // Queue reset email
  await queueEmail({
    to: email,
    subject: 'Reset Your Password - Premium Law Firm',
    html: htmlContent,
    userId: user.id,
  });

  return { success: true, message: 'If the email exists, a reset link has been sent.' };
};

export const resetPassword = async (tokenStr: string, newPassword: string) => {
  const hashedToken = crypto.createHash('sha256').update(tokenStr).digest('hex');

  const dbToken = await prisma.passwordResetToken.findUnique({
    where: { token: hashedToken },
    include: { user: true },
  });

  if (!dbToken || dbToken.expires_at < new Date()) {
    if (dbToken) {
      await prisma.passwordResetToken.delete({ where: { token: hashedToken } });
    }
    throw createError(400, 'Invalid or expired reset token');
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Update password, delete the reset token, and invalidate all user refresh tokens
  await prisma.$transaction([
    prisma.user.update({
      where: { id: dbToken.user_id },
      data: { password: hashedPassword },
    }),
    prisma.passwordResetToken.delete({
      where: { token: hashedToken },
    }),
    prisma.refreshToken.deleteMany({
      where: { user_id: dbToken.user_id },
    }),
  ]);

  return { success: true, message: 'Password has been reset successfully.' };
};
