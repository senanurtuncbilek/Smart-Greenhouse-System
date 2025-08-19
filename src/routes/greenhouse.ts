import { Router } from "express";
import greenhouseController from "../controllers/greenhouse.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loadPermissions } from "../middlewares/loadPermission.middleware";
import { requirePerm } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate, loadPermissions);

router.get("/",  requirePerm("greenhouse_view"),  greenhouseController.list);
router.get("/:id", requirePerm("greenhouse_view"), greenhouseController.detail);

router.post("/",          requirePerm("greenhouse_add"),    greenhouseController.create);
router.patch("/:id",      requirePerm("greenhouse_update"), greenhouseController.update);
router.delete("/:id",     requirePerm("greenhouse_delete"), greenhouseController.remove);

export default router;
