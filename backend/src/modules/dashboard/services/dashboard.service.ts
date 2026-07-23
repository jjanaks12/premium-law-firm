import { DashboardRepository } from "../repositories/dashboard.repository.js";
import type { IDashboardStats } from "../types/index.js";

export class DashboardService {
  static async getOverview(): Promise<IDashboardStats> {
    const [totalUsers, totalRoles, totalDocuments] = await Promise.all([
      DashboardRepository.getTotalUsers(),
      DashboardRepository.getTotalRoles(),
      DashboardRepository.getTotalDocuments(),
    ]);

    return {
      totalUsers,
      totalRoles,
      totalDocuments,
    };
  }
}
