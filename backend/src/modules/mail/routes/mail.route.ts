import { Router } from "express";
import authMiddleware from "../../../middlewares/auth/authentication.middleware.js";
import { authorize } from "../../../middlewares/auth/rbac.middleware.js";
import { validateRequest } from "../../../middlewares/validate/validateRequest.middleware.js";
import { catchAsync } from "../../../utils/catchAsync.js";
import { MailController } from "../controllers/mail.controller.js";
import { sendMailODT } from "../validators/mail.validator.js";

const router = Router();
router.use(authMiddleware());

router.post("/send", authorize("mail", "send"), validateRequest(sendMailODT), catchAsync(MailController.sendMail));

export default router;
