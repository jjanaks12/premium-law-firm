import createHttpError from "http-errors";
import { RolesRepository } from "../repositories/roles.repository.js";
import { invalidateRoleForAllUsers } from "../../../services/permission.service.js";
import { PERMISSION_CATALOG } from "../../../config/permissions.config.js";
import type { ICreateRole, IUpdateRole } from "../types/index.js";

export class RolesService {
  private static validatePermissions(permissions?: Record<string, string[]>) {
    if (!permissions) return;
    for (const [resource, actions] of Object.entries(permissions)) {
      const allowed = PERMISSION_CATALOG[resource];
      if (!allowed) throw new createHttpError.BadRequest(`Unknown resource "${resource}".`);
      for (const action of actions) {
        if (!allowed.includes(action)) {
          throw new createHttpError.BadRequest(`"${action}" is not a valid action for "${resource}".`);
        }
      }
    }
  }

  static getPermissionCatalog() { return PERMISSION_CATALOG; }

  static async listRoles() { return RolesRepository.findAll(); }

  static async getRole(id: number) {
    const role = await RolesRepository.findById(id);
    if (!role) throw new createHttpError.NotFound("Role not found.");
    return role;
  }

  static async createRole(data: ICreateRole) {
    this.validatePermissions(data.permissions);
    return RolesRepository.create(data);
  }

  static async updateRole(id: number, data: IUpdateRole) {
    const role = await RolesRepository.findById(id);
    if (!role) throw new createHttpError.NotFound("Role not found.");
    this.validatePermissions(data.permissions);
    const updated = await RolesRepository.update(id, data);
    await invalidateRoleForAllUsers(id);
    return updated;
  }

  static async deleteRole(id: number) {
    const role = await RolesRepository.findById(id);
    if (!role) throw new createHttpError.NotFound("Role not found.");
    const count = await RolesRepository.countUsersWithRole(id);
    if (count > 0) {
      throw new createHttpError.BadRequest(`Cannot delete: ${count} user(s) still have this role.`);
    }
    await RolesRepository.softDelete(id);
    return { success: true, message: "Role deleted successfully." };
  }
}
