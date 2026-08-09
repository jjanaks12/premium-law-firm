import { Request, Response, NextFunction } from 'express';
import { logsService } from './logs.service';
import createHttpError from 'http-errors';

export const listLogs = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const logs = await logsService.listLogs();
        res.json({ data: logs });
    } catch (error) {
        next(error);
    }
};

export const getLogDetail = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const path = req.query.path as string;
        if (!path) throw createHttpError.BadRequest("Path is required");

        const content = await logsService.getLogDetail(path);
        res.json({ data: { content } });
    } catch (error) {
        next(error);
    }
};

export const deleteLog = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const path = req.query.path as string;
        if (!path) throw createHttpError.BadRequest("Path is required");

        const success = await logsService.deleteLog(path);
        if (success) {
            res.json({ message: "Log deleted successfully" });
        } else {
            throw createHttpError.NotFound("Log file not found");
        }
    } catch (error) {
        next(error);
    }
};
