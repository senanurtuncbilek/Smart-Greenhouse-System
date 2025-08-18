import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

import CustomError from "../utils/Error";
import ResponseUtil from "../utils/Response";
import Enum from "../config/Enum";
import config from "../config";
import { User, Role } from "../db/models";
import redis from "../utils/Redis";

// ==== Refresh Rotation Helpers ==== //
const REFRESH_TTL_SEC = 7 * 24 * 60 * 60; // 7d

function nowSec() {
  return Math.floor(Date.now() / 1000);
}
function newId() {
  return crypto.randomUUID();
}
function keyJti(jti: string) {
  return `rt:jti:${jti}`;
}
function keySid(sid: string) {
  return `rt:sid:${sid}`;
}

type RefreshRecord = {
  userId: number;
  sid: string;
  exp: number;
  rotated: boolean; // true => jti rotation
};


function parseJson<T>(s: string | null): T | null {
  try {
    return s ? (JSON.parse(s) as T) : null;
  } catch {
    return null;
  }
}

const authController = {
  // ===========================
  // LOGIN
  // ===========================
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: "roles", attributes: ["name"] }],
      });
      if (!user)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Authentication Error",
          "Invalid email or password"
        );

      const isPasswordMatch = await bcrypt.compare(password, (user as any).password);
      if (!isPasswordMatch)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Authentication Error",
          "Invalid email or password"
        );

      const roles = (user as any).roles?.map((r: any) => r.name) ?? [];

      // Access
      const accessToken = jwt.sign(
        { id: (user as any).id, email: (user as any).email, roles },
        config.JWT.SECRET as string,
        { expiresIn: "15m" }
      );

      // ---- Refresh (jti + sid) ----
      const sid = newId();
      const jti = newId();

      const refreshToken = jwt.sign(
        { id: (user as any).id, sid },
        config.JWT.REFRESH_SECRET,
        { expiresIn: "7d", jwtid: jti } // jti claim
      );

      const rec: RefreshRecord = {
        userId: (user as any).id,
        sid,
        exp: nowSec() + REFRESH_TTL_SEC,
        rotated: false,
      };

      // jti allowlist kaydı
      await redis.set(keyJti(jti), JSON.stringify(rec), { EX: REFRESH_TTL_SEC });

      // family/sid listesine ekle
      const sidKey = keySid(sid);
      const curList = parseJson<string[]>(await redis.get(sidKey)) ?? [];
      curList.push(jti);
      await redis.set(sidKey, JSON.stringify(curList), { EX: REFRESH_TTL_SEC });

      // Cookie
      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax", // cross-site ise None+Secure + CORS credentials
        path: "/api/auth/refresh",
        maxAge: REFRESH_TTL_SEC * 1000,
      });

      return res
        .status(Enum.HTTP_CODES.OK)
        .json(ResponseUtil.successResponse({ access_token: accessToken }));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  // ===========================
  // REFRESH (Rotation + Reuse Detection)
  // ===========================
  async refresh(req: Request, res: Response) {
    try {
      const token = (req as any).cookies?.refresh_token;
      if (!token)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Unauthorized",
          "No refresh token"
        );

      // 1) JWT doğrula ve jti+sid al
      const payload = jwt.verify(token, config.JWT.REFRESH_SECRET) as any;
      const { jti, sid, id: userId } = payload as {
        jti: string;
        sid: string;
        id: number;
      };

      // 2) jti allowlist kaydını çek
      const rec = parseJson<RefreshRecord>(await redis.get(keyJti(jti)));
      if (!rec || rec.userId !== userId || rec.sid !== sid)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Unauthorized",
          "Invalid or revoked refresh token"
        );

      // 3) Reuse detection: zaten rotated ise -> SID altındaki tüm jti'leri iptal et
      if (rec.rotated === true) {
        const members = parseJson<string[]>(await redis.get(keySid(sid))) ?? [];
        for (const old of members) {
          await redis.del(keyJti(old));
        }
        await redis.del(keySid(sid));

        // (Opsiyonel) logger.warn(`Refresh reuse detected for user ${userId}, sid ${sid}`);

        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Unauthorized",
          "Refresh token reuse detected"
        );
      }

      // 4) Eski jti'yi rotated=true işaretle (reuse gelirse yakalarsın)
      rec.rotated = true;
      const remain = Math.max(1, rec.exp - nowSec());
      await redis.set(keyJti(jti), JSON.stringify(rec), { EX: remain });

      // 5) Kullanıcı/rolleri çek
      const user = await User.findByPk(userId, {
        attributes: ["id", "email"],
        include: [{ model: Role, as: "roles", attributes: ["name"] }],
      });
      if (!user)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Unauthorized",
          "User not found"
        );

      const roles = (user as any).roles?.map((r: any) => r.name) ?? [];

      // 6) Yeni access
      const newAccessToken = jwt.sign(
        { id: (user as any).id, email: (user as any).email, roles },
        config.JWT.SECRET as string,
        { expiresIn: "15m" }
      );

      // 7) Yeni refresh (yeni jti, aynı sid)
      const newJti = newId();
      const newRefresh = jwt.sign(
        { id: (user as any).id, sid },
        config.JWT.REFRESH_SECRET,
        { expiresIn: "7d", jwtid: newJti }
      );

      // 8) Yeni jti allowlist'e
      const newRec: RefreshRecord = {
        userId: (user as any).id,
        sid,
        exp: nowSec() + REFRESH_TTL_SEC,
        rotated: false,
      };
      await redis.set(keyJti(newJti), JSON.stringify(newRec), { EX: REFRESH_TTL_SEC });

      // 9) family listesine ekle
      const list = parseJson<string[]>(await redis.get(keySid(sid))) ?? [];
      list.push(newJti);
      await redis.set(keySid(sid), JSON.stringify(list), { EX: REFRESH_TTL_SEC });

      // 10) Cookie'yi yeni refresh ile güncelle
      res.cookie("refresh_token", newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
        maxAge: REFRESH_TTL_SEC * 1000,
      });

      return res.json({ access_token: newAccessToken });
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  // ===========================
  // LOGOUT (Bu cihaza özel)
  // ===========================
  async logout(req: Request, res: Response) {
    try {
      const token = (req as any).cookies?.refresh_token;
      if (token) {
        try {
          const payload = jwt.verify(token, config.JWT.REFRESH_SECRET) as any;
          const { jti, sid } = payload as { jti: string; sid: string };

          // 1) Bu cihaza ait jti'yi sil
          await redis.del(keyJti(jti));

          // 2) family listesinden çıkar
          const list = parseJson<string[]>(await redis.get(keySid(sid))) ?? [];
          const updated = list.filter((x) => x !== jti);
          if (updated.length > 0) {
            await redis.set(keySid(sid), JSON.stringify(updated), { EX: REFRESH_TTL_SEC });
          } else {
            await redis.del(keySid(sid));
          }
        } catch (err: any) {
          // süresi dolmuş/bozuk ise sessiz geç
          if (!["TokenExpiredError", "JsonWebTokenError"].includes(err?.name)) throw err;
        }
      }

      res.clearCookie("refresh_token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
      });

      return res
        .status(Enum.HTTP_CODES.OK)
        .json(ResponseUtil.successResponse({}));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },
};

export default authController;
