import { Router } from 'express';
import * as notificationController from './controller/notification.controller';
import { verifyAccessToken } from '@/middlewares/checkAuth';
import { notificationRateLimiter } from '@/middlewares/rateLimiter';

const route = Router();

route.get('/', notificationRateLimiter, verifyAccessToken, notificationController.getUserNotifications);
route.post('/send-test', notificationRateLimiter, verifyAccessToken, notificationController.sendTestEmail);

export default route;
