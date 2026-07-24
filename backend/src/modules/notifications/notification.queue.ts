import { Queue } from 'bullmq';
import redisConnection from '../../lib/redis';

export const notificationQueue = new Queue('notification-queue', {
  connection: redisConnection,
});

export const queueEmail = async (options: {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  userId?: string;
}) => {
  await notificationQueue.add('send-email', options, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
  });
};
