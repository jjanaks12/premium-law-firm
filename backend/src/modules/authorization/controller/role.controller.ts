import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";

export const index = async (request: Request, response: Response, next: NextFunction) => {
    try {
        response.send(await prisma.role.findMany({
            where: {
                deleted_at: null
            }
        }));
    } catch (error) {
        throw error
    }
}