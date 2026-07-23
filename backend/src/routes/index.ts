import { Router } from "express";
import authRoute     from "../modules/auth/routes/auth.route.js";
import dashboardRoute from "../modules/dashboard/routes/dashboard.route.js";
import rolesRoute    from "../modules/roles/routes/roles.route.js";
import documentsRoute from "../modules/documents/routes/documents.route.js";
import mailRoute     from "../modules/mail/routes/mail.route.js";

const router = Router();

interface Route { path: string; route: Router; }

const routes: Route[] = [
  { path: "/auth",      route: authRoute },
  { path: "/dashboard", route: dashboardRoute },
  { path: "/roles",     route: rolesRoute },
  { path: "/documents", route: documentsRoute },
  { path: "/mail",      route: mailRoute },
];

routes.forEach(({ path, route }) => router.use(path, route));

export default router;
