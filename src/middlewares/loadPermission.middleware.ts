import { Request, Response, NextFunction } from "express";
import Role from "../db/models/Roles";
import RolePrivilege from "../db/models/RolePrivileges";
import UserRole from "../db/models/UserRole";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";


 // Kullanıcının rollerini ve o rollerin permissionslarını okuyup req.usera koyar.

export async function loadPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.user?.id) {
      throw new CustomError(
        Enum.HTTP_CODES.UNAUTHORIZED,
        "Unauthorized",
        "Missing user on request"
      );
    }

    // Kullanıcının rol id'leri
    const userRoles = await UserRole.findAll({
      where: { user_id: req.user.id },
      attributes: ["role_id"],
    });

    const roleIds = userRoles.map((ur) => ur.role_id);
    if (roleIds.length === 0) {
      // Rolü yoksa izinler de boş
      req.user.roles = [];
      req.user.permissions = [];
      return next();
    }

    const roles = await Role.findAll({
      where: { id: roleIds },
      attributes: ["name"],
    });
    req.user.roles = roles.map((r) => r.name);

    // Roledeki permission kayıtları
    const rolePrivs = await RolePrivilege.findAll({
      where: { role_id: roleIds },
      attributes: ["permission"],
    });

    // Tekile indir
    const perms = Array.from(new Set(rolePrivs.map((rp) => rp.permission)));
    req.user.permissions = perms;

    return next();
  } catch (err) {
    return next(err);
  }
}
