import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.route';

const route = Router();

route.get('/health', (req, res) => {
    res.json({ success: true, message: "Backend is healthy!" });
});

route.use('/auth', authRoutes);

export default route;
