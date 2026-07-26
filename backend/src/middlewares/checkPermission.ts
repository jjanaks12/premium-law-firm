import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";

export const can = (resource: string, action: string) => {
  return async (request: Request, response: Response, next: NextFunction) => {
    try {
      const user = request.auth_user as any;
      if (!user) {
        return next(createHttpError.Unauthorized('You are not logged in'));
      }

      const permissions = user.role?.permissions;
      if (permissions && typeof permissions === 'object') {
        const permissionKey = `${resource}:${action}`;
        const hasPermission = (permissions as Record<string, boolean>)[permissionKey] === true;
        if (hasPermission) {
          return next();
        }
      }

      return next(createHttpError.Forbidden('Forbidden: Insufficient permissions'));
    } catch (error) {
      next(error);
    }
  };
};