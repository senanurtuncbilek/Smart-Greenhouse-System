import { Router } from "express";
const router = Router();

import userController from "../controllers/user.controller";
import { authenticate } from "../middlewares/auth.middleware";

router.get("/list", authenticate, userController.list);
router.post("/register", userController.register);
router.post("/add", userController.add);
router.patch("/update/:id", userController.update);
router.delete("/delete/:id", userController.delete);

export default router;
