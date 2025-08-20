/**
 * @openapi
 * /zone/list:
 *   get:
 *     tags: [Zone]
 *     summary: Zone listesi
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: query
 *         name: greenhouse_id
 *         required: true
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
 * /zone/add:
 *   post:
 *     tags: [Zone]
 *     summary: Zone oluştur
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, greenhouse_id]
 *             properties:
 *               name: { type: string }
 *               greenhouse_id: { type: integer }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

/**
 * @openapi
 * /zone/update/{id}:
 *   patch:
 *     tags: [Zone]
 *     summary: Zone güncelle
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
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

/**
 * @openapi
 * /zone/delete/{id}:
 *   delete:
 *     tags: [Zone]
 *     summary: Zone sil
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
 * /zone/{id}:
 *   get:
 *     tags: [Zone]
 *     summary: Zone detayı
 *     security: [ { bearerAuth: [] } ]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */

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