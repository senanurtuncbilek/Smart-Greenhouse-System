import { Router } from "express";
import roleController from "../controllers/role.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loadPermissions } from "../middlewares/loadPermission.middleware";
import { requirePerm } from "../middlewares/authorize.middleware";

const router = Router();


router.use(authenticate, loadPermissions);


router.get("/", requirePerm("role_view"), roleController.list);
router.post("/add", /*requirePerms("role_add"),*/ roleController.add);
router.post("/update/:id", requirePerm("role_update"), roleController.update);
router.post("/delete/:id", requirePerm("role_delete"), roleController.delete);

export default router;
