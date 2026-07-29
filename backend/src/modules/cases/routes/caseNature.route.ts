import { Router } from "express";
import * as caseNatureController from "../controller/caseNature.controller";
import { verifyAccessToken } from "@/middlewares/checkAuth";

const router = Router();

router.use(verifyAccessToken);

router.get("/", caseNatureController.index);
router.post("/", caseNatureController.store);
router.get("/:id", caseNatureController.show);
router.patch("/:id", caseNatureController.update);
router.delete("/:id", caseNatureController.destroy);

export default router;
