import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from 'http-errors';
import bcrypt from 'bcrypt';
import { updateProfileSchema, changePasswordSchema } from '@app/validations';

export const profile = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.auth_user?.id },
            include: { role: true },
        });
        response.json({ success: true, data: user });
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

        const { first_name, last_name } = await updateProfileSchema.validate(request.body, { abortEarly: false });

        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                first_name,
                last_name,
            },
            include: { role: true }
        });

        response.json({ success: true, message: "Profile updated successfully", data: updatedUser });
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