import { Router } from "express";
import * as caseController from "../controller/case.controller";
import { verifyAccessToken } from "@/middlewares/checkAuth";

import * as relationsController from "../controller/caseRelations.controller";
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
const router = Router();

// Assuming you want authentication for these routes
router.use(verifyAccessToken);

router.get("/", caseController.index);
router.post("/", caseController.store);
router.get("/meta/party-roles", relationsController.getPartyRoles);
router.post("/meta/party-roles", relationsController.addPartyRole);
router.put("/meta/party-roles/:id", relationsController.updatePartyRole);
router.delete("/meta/party-roles/:id", relationsController.deletePartyRole);
router.get("/meta/court-levels", relationsController.getCourtLevels);
router.post("/meta/court-levels", relationsController.addCourtLevel);
router.put("/meta/court-levels/:id", relationsController.updateCourtLevel);
router.delete("/meta/court-levels/:id", relationsController.deleteCourtLevel);
router.get("/:id", caseController.show);
router.patch("/:id", caseController.update);
router.delete("/:id", caseController.destroy);

// Nested Relations
router.post("/:id/parties", relationsController.addParty);
router.put("/:id/parties/:subId", relationsController.updateParty);
router.delete("/:id/parties/:subId", relationsController.removeParty);

router.post("/:id/lawyers", relationsController.addLawyer);
router.delete("/:id/lawyers/:subId", relationsController.removeLawyer);

router.post("/:id/hearings", relationsController.addHearing);
router.delete("/:id/hearings/:subId", relationsController.removeHearing);

router.post("/:id/pleadings", relationsController.addPleading);
router.delete("/:id/pleadings/:subId", relationsController.removePleading);

router.post("/:id/proceedings", relationsController.addProceeding);
router.delete("/:id/proceedings/:subId", relationsController.removeProceeding);

router.post("/:id/precedents", relationsController.addPrecedent);
router.delete("/:id/precedents/:subId", relationsController.removePrecedent);

router.post("/:id/payments", relationsController.addPayment);
router.delete("/:id/payments/:subId", relationsController.removePayment);

router.post("/:id/counselings", relationsController.addCounseling);
router.delete("/:id/counselings/:subId", relationsController.removeCounseling);

router.post("/:id/documents", upload.single("file"), relationsController.addDocument);
router.delete("/:id/documents/:subId", relationsController.removeDocument);

export default router;
