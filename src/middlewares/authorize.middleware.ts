import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";

/** Tek izin: endpoint için 1 anahtar */
export function requirePerm(key: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const perms = req.user?.permissions ?? [];
    const ok = perms.includes(key);
    if (!ok) {
      // Not: authenticate zaten önce çalışıyor; bu yüzden 403 daha anlamlı.
      return next(
        new CustomError(
          Enum.HTTP_CODES.FORBIDDEN, // 401 yerine 403 öneri
          "Need Permission",
          `Requires: ${key}`
        )
      );
    }
    return next();
  };
}
