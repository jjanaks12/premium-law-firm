import 'dotenv/config';
import express from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import '@/modules/notifications/notification.worker';
import router from '@/routes';
import { errorHandler, notFound } from '@/middlewares/errorHandler';

const app = express();

const allowedOrigins = process.env.CLIENT_URL ? process.env.CLIENT_URL.split(',').map(url => url.trim()) : [];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(json());
app.use(urlencoded({ extended: false }));
app.use('/uploads', express.static('uploads'));

app.use('/api/v1', router);

// Global Error Handler
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
