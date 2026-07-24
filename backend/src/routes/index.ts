import { Router } from 'express';
import authRoutes from '@/modules/auth/auth.route';
import roleRoutes from '@/modules/authorization/routes/role.route';
import notificationRoutes from '@/modules/notifications/notification.route';

const route = Router();

route.get('/', (req, res) => {
    res.json({ success: true, message: "Backend is healthy!" });
});

route.use('/auth', authRoutes);
route.use('/roles', roleRoutes);
route.use('/notifications', notificationRoutes);

export default route;
