import { Router } from "express";
import * as resourceController from "../controller/resource.controller";
import { verifyAccessToken } from "@/middlewares/checkAuth";
import { can } from "@/middlewares/checkPermission";
import multer from "multer";
import path from "path";
import fs from "fs";

// Ensure uploads folder exists in local workspace CWD (backend)
const uploadDir = path.join(process.cwd(), "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Disk Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + "-" + uniqueSuffix + ext);
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB maximum file size limit
  },
});

const route = Router();

route.get("/", [verifyAccessToken, can("resources", "list")], resourceController.index);
route.post("/upload", [verifyAccessToken, upload.single("file")], resourceController.uploadResource);
route.get("/:id", [verifyAccessToken], resourceController.show);
route.put("/:id", [verifyAccessToken, upload.single("file")], resourceController.update);
route.delete("/:id", [verifyAccessToken, can("resources", "delete")], resourceController.destroy);

export default route;
