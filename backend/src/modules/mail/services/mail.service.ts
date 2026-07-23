import { transporter } from "../../../config/mail.js";
import { forgotPasswordTemplate } from "../templates/forgotPassword.template.js";
import { notificationTemplate } from "../templates/notification.template.js";
import { env } from "../../../config/env.js";

export class MailService {
  static async sendForgotPasswordOtp(email: string, otp: string): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: env.SMTP_USER,
        to: email,
        subject: "Password Reset OTP",
        html: forgotPasswordTemplate(otp),
      });
      return true;
    } catch (err) {
      console.error("sendForgotPasswordOtp error:", err);
      return false;
    }
  }

  static async sendNotification(email: string, subject: string, message: string): Promise<boolean> {
    try {
      await transporter.sendMail({
        from: env.SMTP_USER,
        to: email,
        subject,
        html: notificationTemplate(subject, message),
      });
      return true;
    } catch (err) {
      console.error("sendNotification error:", err);
      return false;
    }
  }

  /** Generic send — accepts a raw HTML string. */
  static async sendRaw(to: string, subject: string, html: string): Promise<boolean> {
    try {
      await transporter.sendMail({ from: env.SMTP_USER, to, subject, html });
      return true;
    } catch (err) {
      console.error("sendRaw error:", err);
      return false;
    }
  }
}
