import type { Request, Response } from "express";
import createHttpError from "http-errors";
import { DocumentsService } from "../services/documents.service.js";
import { StatusCodes } from "../../../constants/statusCode.js";

export class DocumentsController {
  static async upload(req: Request, res: Response) {
    if (!req.file) throw new createHttpError.BadRequest("No file uploaded.");
    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const response = await DocumentsService.upload(parseInt(req.user.id), req.file, baseUrl);
    res.status(StatusCodes.CREATED).json(response);
  }

  static async listMine(req: Request, res: Response) {
    const data = await DocumentsService.listMyDocuments(parseInt(req.user.id));
    res.status(StatusCodes.SUCCESS).json({ success: true, message: "Documents fetched.", data });
  }

  static async deleteDocument(req: Request, res: Response) {
    const response = await DocumentsService.deleteDocument(
      parseInt(req.params.id),
      parseInt(req.user.id),
    );
    res.status(StatusCodes.SUCCESS).json(response);
  }
}
