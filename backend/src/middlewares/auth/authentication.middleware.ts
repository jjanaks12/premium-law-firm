import type { NextFunction, Request, Response } from "express";
import { verifyAccessToken } from "../../utils/jwt.js";
import createHttpError from "http-errors";
import type { UserType } from "../../modules/auth/types/index.js";

const authMiddleware =
  () => async (req: Request, _res: Response, next: NextFunction) => {
    try {
      const token = req.cookies?.accessToken;
      if (!token) {
        const hasRefresh = !!req.cookies?.refreshToken;
        return next(createHttpError(401, hasRefresh ? "TOKEN_EXPIRED" : "NO_TOKEN"));
      }
      const decoded = verifyAccessToken(token);
      req.user = { id: decoded.id.toString(), userType: decoded.userType as UserType };
      next();
    } catch (error: any) {
      if (error.name === "TokenExpiredError") {
        return next(createHttpError(401, "TOKEN_EXPIRED"));
      }
      return next(createHttpError(403, "INVALID_TOKEN"));
    }
  };

export default authMiddleware;
