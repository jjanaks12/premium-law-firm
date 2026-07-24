import prisma from "@/lib/prisma";
import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import jwt from "jsonwebtoken"

export const verifyAccessToken = async (request: Request, response: Response, next: NextFunction) => {
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next(createHttpError.Unauthorized('No token provided'));
    }

    const token = authHeader.split(' ')[1];
    const secret = process.env.ACCESS_TOKEN_SECRET;
    if (!secret) {
        return next(createHttpError.InternalServerError('Server misconfiguration: missing ACCESS_TOKEN_SECRET'));
    }

    jwt.verify(token, secret, async (error, payload) => {

        try {
            if (error || !payload) {
                return next(createHttpError.Unauthorized('Invalid or expired token'));
            }

            if (typeof payload !== 'string') {
                const user = await prisma.user.findFirstOrThrow({
                    where: { id: payload.aud as string },
                    omit: {
                        password: true
                    }
                });
                request.user = user;
            }

            next();
        } catch (error) {
            // Verification failed (invalid signature or expired)
            return next(createHttpError.Unauthorized('Invalid or expired token'));
        }
    })
}