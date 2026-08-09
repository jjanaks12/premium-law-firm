import { NextFunction, Request, Response } from "express";
import createHttpError from "http-errors";
import { logsService } from "../modules/logs/logs.service";

export const notFound = async (_: Request, __: Response, next: NextFunction) => {
    next(createHttpError.NotFound())
}

export const errorHandler = (error: any, request: Request, response: Response, next: NextFunction) => {
    let status = error.status || 500
    const newError: any = {
        status: status,
        message: error.message
    }

    console.log(error);

    if (status >= 500) {
        logsService.appendLog('ERROR', request.method, request.originalUrl || request.url, error.message, { stack: error.stack });
    }

    if (error.errors && error.errors.length > 0) {
        status = 422
        newError.errors = error.errors
    }

    response.status(status)
        .send({
            error: newError
        })
}