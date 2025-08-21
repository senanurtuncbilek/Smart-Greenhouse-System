/**
 * @swagger
 * /auth/login:
 *   post:
 *     tags:
 *       - Auth
 *     summary: Kullanıcı girişi yapar
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       '200':
 *         description: Başarılı giriş
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 code:
 *                   type: number
 *                   example: 200
 *                 data:
 *                   $ref: '#/components/schemas/LoginResponse'
 *       '401':
 *         description: Yetkisiz
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */

/**
 * @openapi
 * /auth/refresh:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh token ile yeni access token üretir
 *     responses:
 *       '200':
 *         description: Yeni access token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '401':
 *         description: Yetkisiz
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */

/**
 * @openapi
 * /auth/logout:
 *   post:
 *     tags: [Auth]
 *     summary: Refresh token'ı geçersiz kılar (bu cihaz)
 *     responses:
 *       '200':
 *         description: Çıkış yapıldı
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       '429':
 *         $ref: '#/components/responses/RateLimited'
 */


import { Router } from "express";
import authController from "../controllers/auth.controller";
const router = Router();
import { loginLimiter, refreshLimiter } from "../middlewares/rateLimit";

router.post("/login", loginLimiter, authController.login);
router.post("/refresh", refreshLimiter, authController.refresh);
router.post("/logout", authController.logout);

export default router;
