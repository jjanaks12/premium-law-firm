import { Router } from "express";
import authMiddleware from "../../../middlewares/auth/authentication.middleware.js";
import { authorize } from "../../../middlewares/auth/rbac.middleware.js";
import { upload } from "../../../middlewares/multer/file.middleware.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { DocumentsController } from "../controllers/documents.controller.js";

const router = Router();
router.use(authMiddleware());

router.post("/upload", authorize("document", "create"), upload.single("file"), catchAsync(DocumentsController.upload));
router.get("/mine",    authorize("document", "read"),   catchAsync(DocumentsController.listMine));
router.delete("/:id",  authorize("document", "delete"), catchAsync(DocumentsController.deleteDocument));

export default router;
