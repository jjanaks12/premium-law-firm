import { Request, Response, NextFunction } from 'express';
import createError from 'http-errors';

export const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (createError.isHttpError(err)) {
    return res.status(err.status).json({
      success: false,
      message: err.message,
    });
  }

  console.error('[Error]:', err);

  res.status(500).json({
    success: false,
    message: 'Internal Server Error',
  });
};
