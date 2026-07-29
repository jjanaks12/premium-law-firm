import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { userInviteSchema, acceptInvitationSchema } from "@app/validations";
import { queueEmail } from "@/modules/notifications/notification.queue";
import { renderEmailTemplate } from "@/modules/notifications/services/emailTemplates";

const CLIENT_URL = (process.env.CLIENT_URL || "http://localhost:3000").split(",")[0];

export const index = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const { search, role_id, status } = request.query;

    const filter: any = {};

    // By default, filter out soft-deleted users unless explicit status is 'deleted'
    if (status === "deleted") {
      filter.deleted_at = { not: null };
    } else {
      filter.deleted_at = null;
      if (status === "active") {
        filter.status = "active";
      } else if (status === "disabled") {
        filter.status = "disabled";
      } else if (status === "invited") {
        filter.status = "invited";
      }
    }

    if (role_id) {
      filter.role_id = role_id as string;
    }

    if (search) {
      const searchStr = search as string;
      filter.OR = [
        { first_name: { contains: searchStr, mode: "insensitive" } },
        { last_name: { contains: searchStr, mode: "insensitive" } },
        { email: { contains: searchStr, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where: filter,
      include: {
        role: true,
      },
      orderBy: {
        created_at: "desc",
      },
      omit: {
        password: true,
      },
    });

    response.json({ success: true, data: users });
  } catch (error) {
    next(error);
  }
};

export const invite = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const validatedData = await userInviteSchema.validate(request.body, { abortEarly: false });
    const { email, first_name, last_name, role_id } = validatedData;

    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    const locale = request.headers["accept-language"] as string | undefined;
    let localePath = "";
    if (locale) {
      const primaryLocale = locale.split(",")[0].split("-")[0].trim().toLowerCase();
      if (["en", "np"].includes(primaryLocale)) {
        localePath = `/${primaryLocale}`;
      }
    }

    if (existing) {
      if (existing.deleted_at === null) {
        throw createHttpError.BadRequest("User with this email already exists");
      } else {
        // If soft-deleted, restore and re-invite the user
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

        const restoredUser = await prisma.user.update({
          where: { id: existing.id },
          data: {
            first_name,
            last_name,
            role_id,
            status: "invited",
            invitation_token: token,
            invitation_expires_at: expiresAt,
            deleted_at: null,
          },
        });

        // Send invitation email
        const inviteUrl = `${CLIENT_URL}${localePath}/accept-invitation?token=${token}`;
        const inviterName = request.auth_user
          ? `${request.auth_user.first_name} ${request.auth_user.last_name}`
          : "Administrator";

        const html = renderEmailTemplate("inviteUser", {
          name: `${first_name} ${last_name}`,
          inviteUrl,
          inviterName,
        });

        await queueEmail({
          to: email,
          subject: "Invitation to join Premium Law Firm",
          html,
          userId: restoredUser.id,
        });

        return response.status(200).json({
          success: true,
          message: "User was restored and invitation email sent successfully",
          data: { id: restoredUser.id, email: restoredUser.email },
        });
      }
    }

    // Create new invited user
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const newUser = await prisma.user.create({
      data: {
        email,
        first_name,
        last_name,
        role_id,
        status: "invited",
        invitation_token: token,
        invitation_expires_at: expiresAt,
      },
    });

    // Send invitation email
    const inviteUrl = `${CLIENT_URL}${localePath}/accept-invitation?token=${token}`;
    const inviterName = request.auth_user
      ? `${request.auth_user.first_name} ${request.auth_user.last_name}`
      : "Administrator";

    const html = renderEmailTemplate("inviteUser", {
      name: `${first_name} ${last_name}`,
      inviteUrl,
      inviterName,
    });

    await queueEmail({
      to: email,
      subject: "Invitation to join Premium Law Firm",
      html,
      userId: newUser.id,
    });

    response.status(201).json({
      success: true,
      message: "Invitation email sent successfully",
      data: { id: newUser.id, email: newUser.email },
    });
  } catch (error) {
    next(error);
  }
};

export const acceptInvitation = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const validatedData = await acceptInvitationSchema.validate(request.body, { abortEarly: false });
    const { token, password } = validatedData;

    const user = await prisma.user.findUnique({
      where: { invitation_token: token },
    });

    if (!user || user.deleted_at !== null) {
      throw createHttpError.BadRequest("Invalid or expired invitation token");
    }

    if (user.invitation_expires_at && user.invitation_expires_at < new Date()) {
      throw createHttpError.BadRequest("Invitation token has expired");
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        status: "active",
        invitation_token: null,
        invitation_expires_at: null,
      },
    });

    response.json({
      success: true,
      message: "Invitation accepted and account activated successfully",
      data: { id: updatedUser.id, email: updatedUser.email },
    });
  } catch (error) {
    next(error);
  }
};

export const disable = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
      include: { role: true },
    });

    if (!user) {
      throw createHttpError.NotFound("User not found");
    }

    if (request.auth_user && request.auth_user.id === id) {
      throw createHttpError.BadRequest("You cannot disable your own account");
    }

    if (user.role?.name.toLowerCase() === "admin") {
      throw createHttpError.BadRequest("You cannot disable a user with the Admin role");
    }

    if (user.status === "invited") {
      throw createHttpError.BadRequest("Cannot disable a user with a pending invitation");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: "disabled" },
    });

    response.json({ success: true, message: "User disabled successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const enable = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw createHttpError.NotFound("User not found");
    }

    if (user.status === "invited") {
      throw createHttpError.BadRequest("Cannot enable a user with a pending invitation");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { status: "active" },
    });

    response.json({ success: true, message: "User enabled successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const destroy = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
      include: { role: true },
    });

    if (!user) {
      throw createHttpError.NotFound("User not found");
    }

    // Prevent deleting self
    if (request.auth_user && request.auth_user.id === id) {
      throw createHttpError.BadRequest("You cannot delete your own account");
    }

    if (user.role?.name.toLowerCase() === "admin") {
      throw createHttpError.BadRequest("You cannot delete a user with the Admin role");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { deleted_at: new Date() },
    });

    response.json({ success: true, message: "User soft-deleted successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const restore = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const user = await prisma.user.findFirst({
      where: { id, deleted_at: { not: null } },
    });

    if (!user) {
      throw createHttpError.NotFound("Soft-deleted user not found");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: { deleted_at: null },
    });

    response.json({ success: true, message: "User restored successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const update = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;
    const { first_name, last_name, role_id } = request.body;

    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw createHttpError.NotFound("User not found");
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        first_name,
        last_name,
        role_id,
      },
      include: {
        role: true,
      },
    });

    response.json({ success: true, message: "User updated successfully", data: updated });
  } catch (error) {
    next(error);
  }
};

export const resendInvite = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;

    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw createHttpError.NotFound("User not found");
    }

    if (user.status !== "invited") {
      throw createHttpError.BadRequest("This user invitation has already been accepted or the user is disabled");
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        invitation_token: token,
        invitation_expires_at: expiresAt,
      },
    });

    const locale = request.headers["accept-language"] as string | undefined;
    let localePath = "";
    if (locale) {
      const primaryLocale = locale.split(",")[0].split("-")[0].trim().toLowerCase();
      if (["en", "np"].includes(primaryLocale)) {
        localePath = `/${primaryLocale}`;
      }
    }

    const inviteUrl = `${CLIENT_URL}${localePath}/accept-invitation?token=${token}`;
    const inviterName = request.auth_user
      ? `${request.auth_user.first_name} ${request.auth_user.last_name}`
      : "Administrator";

    const html = renderEmailTemplate("inviteUser", {
      name: `${user.first_name} ${user.last_name}`,
      inviteUrl,
      inviterName,
    });

    await queueEmail({
      to: user.email,
      subject: "Invitation to join Premium Law Firm (Resend)",
      html,
      userId: user.id,
    });

    response.json({ success: true, message: "Invitation email resent successfully" });
  } catch (error) {
    next(error);
  }
};

export const sendResetPasswordLink = async (request: Request, response: Response, next: NextFunction) => {
  try {
    const id = request.params.id as string;

    const user = await prisma.user.findFirst({
      where: { id, deleted_at: null },
    });

    if (!user) {
      throw createHttpError.NotFound("User not found");
    }

    if (user.status === "invited") {
      throw createHttpError.BadRequest("This user has a pending invitation. Please use 'Resend Invite' instead.");
    }

    // Generate reset token and save to db (exactly like forgotPassword in auth.service)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    await prisma.passwordResetToken.create({
      data: {
        token: hashedToken,
        user_id: user.id,
        expires_at: new Date(Date.now() + 15 * 60 * 1000), // 15 minutes
      },
    });

    const locale = request.headers["accept-language"] as string | undefined;
    let localePath = "";
    if (locale) {
      const primaryLocale = locale.split(",")[0].split("-")[0].trim().toLowerCase();
      if (["en", "np"].includes(primaryLocale)) {
        localePath = `/${primaryLocale}`;
      }
    }

    const resetUrl = `${CLIENT_URL}${localePath}/reset-password?token=${resetToken}`;
    const html = renderEmailTemplate("forgotPassword", {
      name: `${user.first_name} ${user.last_name}`,
      resetUrl,
    });

    await queueEmail({
      to: user.email,
      subject: "Reset Your Password - Premium Law Firm",
      html,
      userId: user.id,
    });

    response.json({ success: true, message: "Password reset link sent successfully" });
  } catch (error) {
    next(error);
  }
};
