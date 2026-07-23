import type { Request, Response } from "express";
import { DashboardService } from "../services/dashboard.service.js";
import { StatusCodes } from "../../../constants/statusCode.js";

export class DashboardController {
  static async getOverview(_req: Request, res: Response) {
    const data = await DashboardService.getOverview();
    res.status(StatusCodes.SUCCESS).json({
      success: true,
      message: "Dashboard overview fetched successfully.",
      data,
    });
  }
}
