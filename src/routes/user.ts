import { Router } from "express";
const router = Router();

import userController from "../controllers/user.controller";

router.post("/register", userController.register);
router.post("/add", userController.add);
router.post("/register", userController.update);
router.post("/register", userController.delete);

export default router;
