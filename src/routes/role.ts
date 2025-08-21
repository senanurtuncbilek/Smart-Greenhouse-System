/**
 * @openapi
 * /role/add:
 *   post:
 *     tags:
 *       - Role
 *     summary: Rol oluştur
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
 *               - permissions
 *             properties:
 *               name:
 *                 type: string
 *               is_active:
 *                 type: boolean
 *                 default: true
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '201':
 *         description: Created
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */

/**
 * @openapi
 * /role/update/{id}:
 *   post:
 *     tags:
 *       - Role
 *     summary: Rol güncelle
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
 *               is_active:
 *                 type: boolean
 *               permissions:
 *                 type: array
 *                 items:
 *                   type: string
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
 * /role/{id}/permissions:
 *   get:
 *     tags:
 *       - Role
 *     summary: Rol izinlerini getir
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
 * /role/{id}/permissions:
 *   patch:
 *     tags:
 *       - Role
 *     summary: Rol izinlerini güncelle (add/remove)
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
 *               add:
 *                 type: array
 *                 items:
 *                   type: string
 *               remove:
 *                 type: array
 *                 items:
 *                   type: string
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '403':
 *         description: Forbidden
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */



import { Router } from "express";
import roleController from "../controllers/role.controller";
import { authenticate } from "../middlewares/auth.middleware";
import { loadPermissions } from "../middlewares/loadPermission.middleware";
import { requirePerm } from "../middlewares/authorize.middleware";

const router = Router();

router.use(authenticate, loadPermissions);

router.get("/", requirePerm("role_view"), roleController.list);
router.post("/add", requirePerm("role_add"), roleController.add);
router.post("/update/:id", requirePerm("role_update"), roleController.update);
router.post("/delete/:id", requirePerm("role_delete"), roleController.delete);

router.get("/:id/permissions", requirePerm("role_view"), roleController.getPermissions);
router.patch("/:id/permissions", requirePerm("role_update"), roleController.patchPermissions);

export default router;
