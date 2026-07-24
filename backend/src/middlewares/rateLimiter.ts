import rateLimit from 'express-rate-limit';

export const notificationRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10,             // Limit each IP to 10 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests, please try again later.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const dailyEmailRateLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 150,                       // Limit each IP to 150 email requests per day
  message: {
    success: false,
    message: 'Daily email sending limit reached (150 emails per day). Please try again tomorrow.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
