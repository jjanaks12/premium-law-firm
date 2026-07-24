import { Request, Response, NextFunction } from 'express';
import { AnySchema, ValidationError } from 'yup';
import createError from 'http-errors';

export const validate = (schema: AnySchema) => async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const validatedData = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.body = validatedData;
    next();
  } catch (error) {
    if (error instanceof ValidationError) {
      const errors = error.inner.reduce((acc: Record<string, string>, err) => {
        if (err.path) {
          acc[err.path] = err.message;
        }
        return acc;
      }, {});

      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors,
      });
    }
    next(createError(400, 'Invalid input data'));
  }
};
