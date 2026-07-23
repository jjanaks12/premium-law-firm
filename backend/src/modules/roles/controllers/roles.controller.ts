import type { Request, Response } from "express";
import { RolesService } from "../services/roles.service.js";
import { StatusCodes } from "../../../constants/statusCode.js";

export class RolesController {
  static async getPermissionCatalog(_req: Request, res: Response) {
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Permission catalog fetched.", data: RolesService.getPermissionCatalog() });
  }

  static async listRoles(_req: Request, res: Response) {
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Roles fetched.", data: await RolesService.listRoles() });
  }

  static async getRole(req: Request, res: Response) {
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Role fetched.", data: await RolesService.getRole(parseInt(req.params.id)) });
  }

  static async createRole(req: Request, res: Response) {
    res.status(StatusCodes.CREATED).json({ success: true, message: "Role created.", data: await RolesService.createRole(req.body) });
  }

  static async updateRole(req: Request, res: Response) {
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Role updated.", data: await RolesService.updateRole(parseInt(req.params.id), req.body) });
  }

  static async deleteRole(req: Request, res: Response) {
    res.status(StatusCodes.SUCCESS).json(await RolesService.deleteRole(parseInt(req.params.id)));
  }
}
