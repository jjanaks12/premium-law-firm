import { Request, Response, NextFunction } from "express";
import { logsService } from "../modules/logs/logs.service";

export const requestLogger = (req: Request, res: Response, next: NextFunction) => {
    // Record start time
    const start = Date.now();

    // Hook into response finish to log the request
    res.on('finish', () => {
        const duration = Date.now() - start;
        const level = res.statusCode >= 500 ? 'ERROR' : res.statusCode >= 400 ? 'WARN' : 'INFO';
        const message = `${res.statusCode} ${res.statusMessage || ''} - ${duration}ms`;
        
        // Don't log the body for security reasons (passwords, etc.), but we can log user agent/ip
        const meta = {
            ip: req.ip || req.headers['x-forwarded-for'] || req.socket.remoteAddress,
            userAgent: req.headers['user-agent']
        };

        logsService.appendLog(level, req.method, req.originalUrl || req.url, message, meta);
    });

    next();
};
