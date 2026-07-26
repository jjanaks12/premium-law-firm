import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { updateProfileSchema, changePasswordSchema } from '@app/validations';
import { formatUserAvatarUrl } from "@/lib/file";

export const profile = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.auth_user?.id },
            include: { role: true, avatar: true },
        });
        response.json({ success: true, data: formatUserAvatarUrl(request, user) });
    } catch (error) {
        next(error);
    }
}

export const updateProfile = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const userId = request.auth_user?.id;
        if (!userId) {
            throw createHttpError.Unauthorized('Unauthorized');
        }

        const { first_name, last_name, avatar_id, bio, twitter, linkedin, website, links } = 
            await updateProfileSchema.validate(request.body, { abortEarly: false }) as any;

        const currentUser = await prisma.user.findUnique({
            where: { id: userId }
        });
        const currentDetail = (currentUser?.detail && typeof currentUser.detail === 'object') 
            ? (currentUser.detail as Record<string, any>) 
            : {};

        const updatedDetail = {
            ...currentDetail,
            bio: bio || null,
            twitter: twitter || null,
            linkedin: linkedin || null,
            website: website || null,
            links: links || []
        };

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                first_name,
                last_name,
                avatar_id: avatar_id || null,
                detail: updatedDetail
            },
            include: { role: true, avatar: true }
        });

        response.json({ success: true, message: "Profile updated successfully", data: formatUserAvatarUrl(request, updatedUser) });
    } catch (error) {
        next(error);
    }
}

export const changePassword = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const userId = request.auth_user?.id;
        if (!userId) {
            throw createHttpError.Unauthorized('Unauthorized');
        }

        const { old_password, new_password } = await changePasswordSchema.validate(request.body, { abortEarly: false });

        const user = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!user || !user.password) {
            throw createHttpError.NotFound("User not found");
        }

        const isMatch = await bcrypt.compare(old_password, user.password);
        if (!isMatch) {
            throw createHttpError.BadRequest("Incorrect current password");
        }

        const hashedPassword = await bcrypt.hash(new_password, 10);

        await prisma.user.update({
            where: { id: userId },
            data: {
                password: hashedPassword,
            },
        });

        response.json({ success: true, message: "Password changed successfully" });
    } catch (error) {
        next(error);
    }
}