import fs from "fs";
import path from "path";
import createHttpError from "http-errors";
import type { DocumentType } from "../../../../generated/prisma/enums.js";
import { DocumentsRepository } from "../repositories/documents.repository.js";

function inferDocumentType(mimetype: string): DocumentType {
  if (mimetype.startsWith("image/")) return "IMAGE" as DocumentType;
  if (mimetype === "application/pdf") return "PDF" as DocumentType;
  throw new createHttpError.BadRequest("Uploaded file must be an image or PDF.");
}

export class DocumentsService {
  static async upload(userId: number, file: Express.Multer.File, baseUrl: string) {
    const document = await DocumentsRepository.create({
      url: `${baseUrl}/uploads/${file.filename}`,
      type: inferDocumentType(file.mimetype),
      uploadedById: userId,
    });
    return { success: true, message: "File uploaded successfully.", data: document };
  }

  static async listMyDocuments(userId: number) {
    return DocumentsRepository.findByUploadedUserId(userId);
  }

  static async deleteDocument(id: number, userId: number) {
    const doc = await DocumentsRepository.findById(id);
    if (!doc) throw new createHttpError.NotFound("Document not found.");
    if (doc.uploadedById !== userId) throw new createHttpError.Forbidden("You cannot delete this document.");

    await DocumentsRepository.deleteById(id);

    const filename = doc.url.split("/uploads/")[1];
    if (filename) {
      fs.rm(path.join(process.cwd(), "public", "uploads", filename), { force: true }, () => {});
    }

    return { success: true, message: "Document deleted successfully." };
  }
}
