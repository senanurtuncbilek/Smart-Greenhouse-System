/**
 * @openapi
 * /greenhouse:
 *   post:
 *     tags:
 *       - Greenhouse
 *     summary: Sera oluştur
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - location
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       '201':
 *         description: Oluşturuldu
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '403':
 *         description: Yetki yok
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */

/**
 * @openapi
 * /greenhouse:
 *   get:
 *     tags:
 *       - Greenhouse
 *     summary: Sera listesi
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: q
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       '200':
 *         description: Liste
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */

/**
 * @openapi
 * /greenhouse/{id}:
 *   get:
 *     tags:
 *       - Greenhouse
 *     summary: Sera detayı
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 */

/**
 * @openapi
 * /greenhouse/{id}:
 *   patch:
 *     tags:
 *       - Greenhouse
 *     summary: Sera güncelle
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               location:
 *                 type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */

/**
 * @openapi
 * /greenhouse/{id}:
 *   delete:
 *     tags:
 *       - Greenhouse
 *     summary: Sera sil
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */

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
