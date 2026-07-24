import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";

export const profile = async (request: Request, response: Response, next: NextFunction) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: request.auth_user?.id },
        });
        response.json({ success: true, data: user });
    } catch (error) {
        throw error
    }
}