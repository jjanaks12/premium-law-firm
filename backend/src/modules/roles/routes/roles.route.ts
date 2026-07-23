import { Router } from "express";
import authMiddleware from "../../../middlewares/auth/authentication.middleware.js";
import { authorize } from "../../../middlewares/auth/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate/validateRequest.middleware.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { RolesController } from "../controllers/roles.controller.js";
import { createRoleODT, updateRoleODT } from "../validators/roles.validator.js";

const router = Router();
router.use(authMiddleware());

router.get("/permissions/catalog", authorize("role", "read"), catchAsync(RolesController.getPermissionCatalog));
router.get("/",      authorize("role", "list"),   catchAsync(RolesController.listRoles));
router.get("/:id",   authorize("role", "read"),   catchAsync(RolesController.getRole));
router.post("/",     authorize("role", "create"),  validateRequest(createRoleODT), catchAsync(RolesController.createRole));
router.patch("/:id", authorize("role", "update"),  validateRequest(updateRoleODT), catchAsync(RolesController.updateRole));
router.delete("/:id",authorize("role", "delete"),  catchAsync(RolesController.deleteRole));

export default router;
