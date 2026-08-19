import { Router } from "express";
import { verifyAccessToken } from "@/middlewares/checkAuth";
import { can } from "@/middlewares/checkPermission";
import * as PageController from "../controller/page.controller";
import * as PageTypeController from "../controller/page-type.controller";

const route = Router();

// --- Page Type routes ---
route.get("/page-types", [verifyAccessToken, can("pages", "list")], PageTypeController.index);
route.post("/page-types", [verifyAccessToken, can("pages", "create")], PageTypeController.store);
route.put("/page-types/:id", [verifyAccessToken, can("pages", "update")], PageTypeController.update);
route.delete("/page-types/:id", [verifyAccessToken, can("pages", "delete")], PageTypeController.destroy);

// --- Page routes ---
route.get("/public/insights", PageController.getInsights);
route.get("/", [verifyAccessToken, can("pages", "list")], PageController.index);
route.post("/", [verifyAccessToken, can("pages", "create")], PageController.store);

route.get("/:id", [verifyAccessToken, can("pages", "read")], PageController.show);
route.get("/:id/translations", [verifyAccessToken, can("pages", "read")], PageController.translations);
route.put("/:id", [verifyAccessToken, can("pages", "update")], PageController.update);
route.put("/:id/seo", [verifyAccessToken, can("pages", "update")], PageController.upsertSeo);
route.put("/:id/schema", [verifyAccessToken, can("pages", "update")], PageController.upsertSchema);
route.post("/:id/publish", [verifyAccessToken, can("pages", "update")], PageController.publish);
route.post("/:id/unpublish", [verifyAccessToken, can("pages", "update")], PageController.unpublish);
route.delete("/:id", [verifyAccessToken, can("pages", "delete")], PageController.destroy);

export default route;
