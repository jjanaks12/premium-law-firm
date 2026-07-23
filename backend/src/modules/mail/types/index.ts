export interface IMailPayload {
  to: string;
  subject: string;
  html: string;
}

export interface IMailResult { success: boolean; }
export type MailTemplateName = "forgotPassword" | "notification" | "welcome";
