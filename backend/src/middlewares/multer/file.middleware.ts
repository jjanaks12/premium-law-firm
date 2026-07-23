import multer, { FileFilterCallback } from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join(process.cwd(), "public/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
});

const fileFilter = (_req: any, file: Express.Multer.File, cb: FileFilterCallback) => {
  const allowedExt = /\.(jpeg|jpg|png|webp|pdf)$/i;
  const allowedMime = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
  if (allowedExt.test(file.originalname) && allowedMime.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only JPG, PNG, WEBP, and PDF files are allowed"));
  }
};

export const upload = multer({ storage, fileFilter, limits: { fileSize: 10 * 1024 * 1024 } });
