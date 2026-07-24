import { NextFunction, Request, Response } from 'express';
import * as notificationService from '../services/notification.service';
import { queueEmail } from '../notification.queue';
import createHttpError from 'http-errors';

export const getUserNotifications = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const userId = request.auth_user?.id;
    if (!userId) {
      throw createHttpError.Unauthorized('Unauthorized');
    }
    const notifications = await notificationService.getNotificationsForUser(userId);
    response.json({ success: true, data: notifications });
  } catch (error) {
    next(error);
  }
};

export const sendTestEmail = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { to, subject, body } = request.body;
    if (!to || !subject || !body) {
      throw createHttpError.BadRequest('Missing parameters: to, subject, and body are required.');
    }
    await queueEmail({
      to,
      subject,
      text: body,
      userId: request.auth_user?.id,
    });
    response.json({ success: true, message: 'Email has been queued successfully.' });
  } catch (error) {
    next(error);
  }
};
