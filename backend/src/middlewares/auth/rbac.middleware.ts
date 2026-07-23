import { Request, Response, NextFunction } from "express";
import { getUserPermissions } from "../../services/permission.service.js";

export const authorize = (resource: string, action: string) =>
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    if (!req.user) {
      res.status(401).json({ success: false, message: "Unauthorized" });
      return;
    }

    const permissions = await getUserPermissions(Number(req.user.id));

    if (!permissions || !permissions.isActive) {
      res.status(403).json({ success: false, message: "Role inactive or not found" });
      return;
    }

    const allowedActions = permissions.permissions?.[resource];
    if (!Array.isArray(allowedActions) || !allowedActions.includes(action)) {
      res.status(403).json({
        success: false,
        message: `You don't have permission to ${action} ${resource}`,
      });
      return;
    }

    next();
  };
