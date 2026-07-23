import { Router } from "express";
import authMiddleware from "../../../middlewares/auth/authentication.middleware.js";
import { authorize } from "../../../middlewares/auth/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate/validateRequest.middleware.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { DashboardController } from "../controllers/dashboard.controller.js";
import { dashboardQueryODT } from "../validators/dashboard.validator.js";

const router = Router();
router.use(authMiddleware());

router.get("/overview", authorize("dashboard", "read"), validateRequest(dashboardQueryODT, "query"), catchAsync(DashboardController.getOverview));

export default router;
