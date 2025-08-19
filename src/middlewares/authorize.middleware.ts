import { Request, Response, NextFunction } from "express";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";

export function requirePerm(key: string) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const perms = req.user?.permissions ?? [];
    const ok = perms.includes(key);
    if (!ok) {
      return next(
        new CustomError(
          Enum.HTTP_CODES.FORBIDDEN,
          "Need Permission",
          `Requires: ${key}`
        )
      );
    }
    return next();
  };
}
