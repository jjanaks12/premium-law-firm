import type { DocumentType } from "../../../../generated/prisma/enums.js";

export interface IDocument {
  id: number;
  url: string;
  type: DocumentType;
  uploadedById: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}
