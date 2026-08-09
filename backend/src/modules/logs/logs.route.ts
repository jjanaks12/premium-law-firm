import { Router } from "express";
import { verifyAccessToken } from "../../middlewares/checkAuth";
import { can } from "../../middlewares/checkPermission";
import { listLogs, getLogDetail, deleteLog } from "./logs.controller";

const logsRouter = Router();

logsRouter.get("/", verifyAccessToken, can("logs", "list"), listLogs);
logsRouter.get("/detail", verifyAccessToken, can("logs", "read"), getLogDetail);
logsRouter.delete("/", verifyAccessToken, can("logs", "delete"), deleteLog);

export default logsRouter;
