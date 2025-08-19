import { Router } from "express";
import zoneController from "../controllers/zone.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loadPermissions } from "../middlewares/loadPermission.middleware";
import { requirePerm } from "../middlewares/authorize.middleware";

const router = Router();
router.use(authenticate, loadPermissions);

router.get("/list", requirePerm("zone_view"), zoneController.list);
router.get("/:id", requirePerm("zone_view"), zoneController.detail);
router.post("/add", requirePerm("zone_add"), zoneController.create);
router.patch("/update/:id", requirePerm("zone_update"), zoneController.update);
router.delete("/delete/:id", requirePerm("zone_delete"), zoneController.remove);

export default router;