import { prisma } from "../../../lib/prisma.js";
import type { DocumentType } from "../../../../generated/prisma/enums.js";

export class DocumentsRepository {
  static async create(data: { url: string; type: DocumentType; uploadedById: number }) {
    return prisma.document.create({ data });
  }

  static async findById(id: number) {
    return prisma.document.findUnique({ where: { id } });
  }

  static async findByUploadedUserId(uploadedById: number) {
    return prisma.document.findMany({
      where: { uploadedById, deletedAt: null },
      orderBy: { createdAt: "desc" },
    });
  }

  static async deleteById(id: number) {
    return prisma.document.delete({ where: { id } });
  }

  static async softDeleteById(id: number) {
    return prisma.document.update({ where: { id }, data: { deletedAt: new Date() } });
  }
}
