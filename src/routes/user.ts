import { Router } from "express";
const router = Router();

import userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { requirePerm } from "../middlewares/authorize.middleware";
import { loadPermissions } from "../middlewares/loadPermission.middleware";

// Tüm user router'ı için bir kez yeterli:
router.post("/register", userController.register);

router.use(authenticate, loadPermissions);

router.get("/list",  (req, _res, next) => {
    console.log("RBAC DEBUG → userId:", req.user?.id);
    console.log("RBAC DEBUG → roles:", req.user?.roles);
    console.log("RBAC DEBUG → perms:", req.user?.permissions);
    next();
  }, requirePerm("user_view"), userController.list);

router.post("/add", userController.add);
router.patch("/update/:id", userController.update);
router.delete("/delete/:id", userController.delete);

export default router;
