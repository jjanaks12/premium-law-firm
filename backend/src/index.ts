import 'dotenv/config';
import express from 'express';
import { json, urlencoded } from 'body-parser';
import cors from 'cors';
import router from '@/routes';
import { errorHandler } from '@/middlewares/errorHandler';

const app = express();

app.use(cors({
    origin: process.env.CLIENT_URL || '*',
    credentials: true
}));
app.use(json());
app.use(urlencoded({ extended: false }));

app.use('/api/v1', router);

// Global Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
