import { prisma } from "../../../lib/prisma.js";

export class DashboardRepository {
  static async getTotalUsers() {
    return prisma.user.count({ where: { deletedAt: null } });
  }

  static async getTotalRoles() {
    return prisma.role.count({ where: { deletedAt: null } });
  }

  static async getTotalDocuments() {
    return prisma.document.count({ where: { deletedAt: null } });
  }
}
