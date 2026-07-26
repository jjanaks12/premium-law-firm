import { Router } from 'express';
import * as notificationController from './controller/notification.controller';
import { verifyAccessToken } from '@/middlewares/checkAuth';
import { can } from '@/middlewares/checkPermission';
import { notificationRateLimiter, dailyEmailRateLimiter } from '@/middlewares/rateLimiter';

const route = Router();

route.get('/', notificationRateLimiter, verifyAccessToken, notificationController.getUserNotifications);
route.post('/send-test', notificationRateLimiter, dailyEmailRateLimiter, verifyAccessToken, can('settings', 'update'), notificationController.sendTestEmail);

export default route;
