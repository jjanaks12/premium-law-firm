import { prisma } from "../../../lib/prisma.js";
import type { ICreateRole, IUpdateRole } from "../types/index.js";

export class RolesRepository {
  static async findAll() {
    return prisma.role.findMany({ where: { deletedAt: null }, orderBy: { id: "asc" } });
  }

  static async findById(id: number) {
    return prisma.role.findFirst({ where: { id, deletedAt: null } });
  }

  static async create(data: ICreateRole) {
    return prisma.role.create({ data });
  }

  static async update(id: number, data: IUpdateRole) {
    return prisma.role.update({ where: { id }, data });
  }

  static async softDelete(id: number) {
    return prisma.role.update({ where: { id }, data: { deletedAt: new Date() } });
  }

  static async countUsersWithRole(id: number) {
    return prisma.user.count({ where: { roleId: id } });
  }
}
