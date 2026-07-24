import { Router } from 'express';
import * as authController from './controller/auth.controller';
import { verifyAccessToken } from '@/middlewares/checkAuth';
import { profile } from './controller/profile.controller';
import { dailyEmailRateLimiter, notificationRateLimiter } from '@/middlewares/rateLimiter';

const route = Router();

route.post('/register', [], authController.register);
route.post('/login', [], authController.login);
route.post('/refresh-token', [], authController.refreshToken);
route.post('/logout', [verifyAccessToken], authController.logout);
route.post('/forgot-password', [notificationRateLimiter, dailyEmailRateLimiter], authController.forgotPassword);
route.post('/reset-password', [], authController.resetPassword);
route.get('/me', [verifyAccessToken], profile);

export default route;
