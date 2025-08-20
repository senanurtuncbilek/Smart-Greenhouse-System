/**
 * @openapi
 * /sensor:
 *   get:
 *     tags: [Sensor]
 *     summary: Sensör listesi
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: zone_id
 *         schema: { type: integer }
 *       - in: query
 *         name: page
 *         schema: { type: integer, default: 1 }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 10 }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

/**
 * @openapi
 * /sensor/{id}:
 *   get:
 *     tags: [Sensor]
 *     summary: Sensör detayı
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

/**
 * @openapi
 * /sensor:
 *   post:
 *     tags: [Sensor]
 *     summary: Sensör oluştur
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, type, zone_id, location]
 *             properties:
 *               name: { type: string }
 *               type: { type: string, enum: ["temperature","humidity","soil_moisture","light_level","ph","co2"] }
 *               zone_id: { type: integer }
 *               location: { type: string }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

/**
 * @openapi
 * /sensor/{id}:
 *   patch:
 *     tags: [Sensor]
 *     summary: Sensör güncelle
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string }
 *               location: { type: string }
 *               status: { type: string, enum: ["active","inactive","maintenance","error"] }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

/**
 * @openapi
 * /sensor/{id}:
 *   delete:
 *     tags: [Sensor]
 *     summary: Sensör sil
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

/**
 * @openapi
 * /sensor/{id}/readings:
 *   get:
 *     tags: [Sensor]
 *     summary: Sensör ölçümleri
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *       - in: query
 *         name: from
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: to
 *         schema: { type: string, format: date-time }
 *       - in: query
 *         name: limit
 *         schema: { type: integer, default: 200 }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

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
