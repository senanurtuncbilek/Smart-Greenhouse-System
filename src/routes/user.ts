/**
 * @openapi
 * /user/register:
 *   post:
 *     tags: [User]
 *     summary: Kayıt ol
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, first_name, last_name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
/**
 * @openapi
 * /user/list:
 *   get:
 *     tags: [User]
 *     summary: Kullanıcı listesi
 *     security: [ { bearerAuth: [] } ]
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
/**
 * @openapi
 * /user/add:
 *   post:
 *     tags: [User]
 *     summary: Kullanıcı oluştur
 *     security: [ { bearerAuth: [] } ]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password, first_name, last_name]
 *             properties:
 *               email: { type: string, format: email }
 *               password: { type: string }
 *               first_name: { type: string }
 *               last_name: { type: string }
 *     responses:
 *       201: { description: Created, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
/**
 * @openapi
 * /user/update/{id}:
 *   patch:
 *     tags: [User]
 *     summary: Kullanıcı güncelle
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
 *               first_name: { type: string }
 *               last_name: { type: string }
 *               password: { type: string }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */
/**
 * @openapi
 * /user/delete/{id}:
 *   delete:
 *     tags: [User]
 *     summary: Kullanıcı sil
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
 * /user/{id}/roles:
 *   put:
 *     tags: [User]
 *     summary: Kullanıcıya rol ata (tam set)
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
 *             required: [roles]
 *             properties:
 *               roles: { type: array, items: { type: integer } }
 *     responses:
 *       200: { description: OK, content: { application/json: { schema: { $ref: '#/components/schemas/SuccessResponse' } } } }
 */


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
