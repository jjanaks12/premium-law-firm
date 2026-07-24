import { Worker } from 'bullmq';
import redisConnection from '../../lib/redis';
import { sendEmail } from './services/notification.service';

const worker = new Worker(
  'notification-queue',
  async (job) => {
    if (job.name === 'send-email') {
      const { to, subject, text, html, userId } = job.data;
      console.log(`[Worker] Processing email to ${to} (Job ID: ${job.id})`);
      const result = await sendEmail({ to, subject, text, html, userId });
      if (!result.success) {
        throw new Error(result.error || 'Failed to send email');
      }
      console.log(`[Worker] Successfully sent email to ${to} (Job ID: ${job.id})`);
    }
  },
  {
    connection: redisConnection,
    limiter: {
      max: 5,           // Process at most 5 jobs
      duration: 10000,  // Every 10 seconds
    },
  }
);

worker.on('failed', (job, err) => {
  console.error(`[Worker] Job ${job?.id} failed with error:`, err.message);
});

export default worker;
