import type { Request, Response } from "express";
import { MailService } from "../services/mail.service.js";
import { StatusCodes } from "../../../constants/statusCode.js";

export class MailController {
  /** POST /api/mail/send  — admin-only manual trigger */
  static async sendMail(req: Request, res: Response) {
    const { to, subject, message } = req.body;
    const sent = await MailService.sendNotification(to, subject, message);
    res.status(sent ? StatusCodes.SUCCESS : StatusCodes.INTERNAL_SERVER_ERROR).json({
      success: sent,
      message: sent ? "Email sent successfully." : "Failed to send email.",
    });
  }
}
