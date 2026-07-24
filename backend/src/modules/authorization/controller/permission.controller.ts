import { NextFunction, Request, Response } from "express";
import { moduleRegistry } from "@/lib/moduleRegistry";

export const index = async (request: Request, response: Response, next: NextFunction) => {
    try {
        response.json({
            success: true,
            data: moduleRegistry.getPermissionsMap()
        });
    }
    catch (error) {
        next(error)
    }
}