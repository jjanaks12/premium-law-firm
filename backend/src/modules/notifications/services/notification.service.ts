import nodemailer from 'nodemailer';
import prisma from '@/lib/prisma';

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: Number(process.env.MAIL_PORT || 587),
  secure: process.env.MAIL_PORT === '465',
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

interface SendEmailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  userId?: string;
}

export const sendEmail = async ({ to, subject, text, html, userId }: SendEmailOptions) => {
  const from = process.env.MAIL_FROM || 'no-reply@premiumlawfirm.com';
  
  let status = 'SENT';
  let errorMsg: string | null = null;

  try {
    if (process.env.MAIL_HOST) {
      await transporter.sendMail({
        from,
        to,
        subject,
        text,
        html,
      });
    } else {
      console.log(`[Notification Service] Mock Email Sent:
        From: ${from}
        To: ${to}
        Subject: ${subject}
        Text: ${text || 'N/A'}
        HTML: ${html || 'N/A'}
      `);
    }
  } catch (error: any) {
    status = 'FAILED';
    errorMsg = error.message || String(error);
    console.error('[Notification Service] Error sending email:', error);
  }

  // Save the notification log in the database
  try {
    await prisma.notification.create({
      data: {
        user_id: userId || null,
        type: 'EMAIL',
        recipient: to,
        subject,
        content: html || text || '',
        status,
        error: errorMsg,
      },
    });
  } catch (dbError) {
    console.error('[Notification Service] Failed to log notification in DB:', dbError);
  }

  return { success: status === 'SENT', error: errorMsg };
};

export const getNotificationsForUser = async (userId: string) => {
  return prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { created_at: 'desc' },
  });
};
