import { Router } from 'express';
import { moduleRegistry } from '@/lib/moduleRegistry';
import authRoutes from '@/modules/auth/routes/auth.route';
import roleRoutes from '@/modules/authorization/routes/role.route';
import notificationRoutes from '@/modules/notifications/routes/notification.route';
import userRoutes from '@/modules/users/routes/user.route';
import resourceRoutes from '@/modules/resources/routes/resource.route';
import pageRoutes from '@/modules/pages/routes/page.route';
import caseRoutes from '@/modules/cases/routes/case.route';
import caseNatureRoutes from '@/modules/cases/routes/caseNature.route';
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

moduleRegistry.register('/users', userRoutes, {
  name: 'Users',
  description: 'Handles user invites, enabling/disabling, soft-deletes and restores',
  resources: ["users"],
  actions: ["create", "read", "update", "delete", "list"],
});

moduleRegistry.register('/resources', resourceRoutes, {
  name: 'Resources',
  description: 'Handles document uploads, image and PDF storage, and asset categorization',
  resources: ['resources'],
  actions: ["create", "read", "update", "delete", "list"],
});

moduleRegistry.register('/pages', pageRoutes, {
  name: 'Pages',
  description: 'Handles CMS pages, multilingual content, SEO metadata, and Schema.org structured data',
  resources: ['pages'],
  actions: ["create", "read", "update", "delete", "list"],
});

moduleRegistry.register('/cases', caseRoutes, {
  name: 'Cases',
  description: 'Handles case creations, listing, updating and deleting case records along with parties and lawyers',
  resources: ['cases'],
  actions: ["create", "read", "update", "delete", "list"],
});

moduleRegistry.register('/case-natures', caseNatureRoutes, {
  name: 'Case Natures',
  description: 'Handles CRUD operations for case nature lookups',
  resources: ['cases'], // Assigning to cases resource permission for simplicity
  actions: ["create", "read", "update", "delete", "list"],
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
