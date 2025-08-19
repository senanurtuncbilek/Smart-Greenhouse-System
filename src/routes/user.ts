import { Router } from "express";
const router = Router();

import userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePerm } from "../middlewares/authorize.middleware";
import { loadPermissions } from "../middlewares/loadPermission.middleware";

router.post("/register", userController.register);

router.use(authenticate, loadPermissions);

router.get("/list", requirePerm("user_view"), userController.list);
router.post("/add", requirePerm("user_add"), userController.add);
router.patch("/update/:id", requirePerm("user_update"), userController.update);
router.delete("/delete/:id", requirePerm("user_delete"), userController.delete);

router.put("/:id/roles", requirePerm("user_role_assign"), userController.assignRoles);

export default router;
