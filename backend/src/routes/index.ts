import { Router } from 'express';
import { moduleRegistry } from '@/lib/moduleRegistry';
import authRoutes from '@/modules/auth/auth.route';
import roleRoutes from '@/modules/authorization/routes/role.route';
import notificationRoutes from '@/modules/notifications/notification.route';

// Register all modules with their associated metadata, resources, and exact action abilities
moduleRegistry.register('/auth', authRoutes, {
  name: 'Auth',
  description: 'Handles admin credentials, authentication checks, and reset password tokens',
  resources: ["users"],
  actions: ["create", "read", "update", "delete", "list"],
});

moduleRegistry.register('/roles', roleRoutes, {
  name: 'Authorization',
  description: 'Handles role listings, CRUD role operations, and dynamic permissions matrices',
  resources: ['roles'],
  actions: ["create", "read", "update", "delete", "list"],
});

moduleRegistry.register('/notifications', notificationRoutes, {
  name: 'Notifications',
  description: 'Handles outbound notification logs, template rendering, and alert settings',
  resources: ['dashboard', 'settings'],
  actions: ["read", "update", "list"],
});

const route = Router();

route.get('/', (req, res) => {
  res.json({ success: true, message: "Backend is healthy!" });
});

// Dynamically mount all registered module routers
moduleRegistry.getRoutes().forEach(({ path, router }) => {
  route.use(path, router);
});

// Expose modules registry endpoint
route.get('/modules', (req, res) => {
  res.json({ success: true, data: moduleRegistry.getModules() });
});

export default route;
