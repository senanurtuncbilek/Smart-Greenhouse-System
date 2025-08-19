import { Router } from "express";
import sensorController from "../controllers/sensor.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loadPermissions } from "../middlewares/loadPermission.middleware";
import { requirePerm } from "../middlewares/authorize.middleware";

const router = Router();
router.use(authenticate, loadPermissions);

router.get("/", requirePerm("sensor_view"), sensorController.list);
router.get("/:id", requirePerm("sensor_view"), sensorController.detail);
router.post("/", requirePerm("sensor_add"), sensorController.create);
router.patch("/:id", requirePerm("sensor_update"), sensorController.update);
router.delete("/:id", requirePerm("sensor_delete"), sensorController.remove);

// readings
router.post(
  "/:id/readings",
  requirePerm("sensor_update"),
  sensorController.addReading
);
router.get(
  "/:id/readings",
  requirePerm("sensor_view"),
  sensorController.listReadings
);

export default router;
