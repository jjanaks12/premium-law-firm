import { ZodSchema } from "zod";
import createHttpError from "http-errors";

type ValidationTarget = "body" | "params" | "query";

export const validateRequest =
  (schema: ZodSchema, target: ValidationTarget = "body") =>
  (req: any, _res: any, next: any) => {
    const result = schema.safeParse(req[target]);
    if (!result.success) {
      return next(
        createHttpError(400, result.error.issues.map((e) => e.message).join(", ")),
      );
    }
    if (target === "query") {
      req.validatedQuery = result.data;
    } else {
      req[target] = result.data;
    }
    next();
  };
