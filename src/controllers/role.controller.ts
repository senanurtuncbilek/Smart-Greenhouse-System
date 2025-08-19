import { Request, Response } from "express";
import sequelize from "../db/sequelize";
import Role from "../db/models/Roles";
import RolePrivilege from "../db/models/RolePrivileges";
import UserRole from "../db/models/UserRole";
import ResponseUtil from "../utils/Response";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";
import { privileges as ALL_PRIVS } from "../config/role_privileges";



// **Helpers**
function ensureValidPermissions(perms: string[]) {
  const all = new Set(ALL_PRIVS.map((p) => p.key));
  const invalid = perms.filter((p) => !all.has(p));
  if (invalid.length) {
    throw new CustomError(
      Enum.HTTP_CODES.BAD_REQUEST,
      "Validation Error",
      `Unknown permission(s): ${invalid.join(", ")}`
    );
  }
}

const roleController = {
  async list(req: Request, res: Response) {
    try {
      const roles = await Role.findAll({ order: [["id", "ASC"]] });
      res.json(ResponseUtil.successResponse(roles));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async add(req: Request, res: Response) {
    const body = req.body;

    try {
      const { name, is_active = true, permissions } = body;

      if (!name || name.trim().length === 0) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "Role name is required"
        );
      }

      if (!Array.isArray(permissions) || permissions.length === 0) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "Permissions must be a non-empty array"
        );
      }

      ensureValidPermissions(permissions);

      const t = await sequelize.transaction();

      try {
        const role = await Role.create(
          { name: name.trim(), is_active, created_by: req.user?.id },
          { transaction: t }
        );

        const createdBy = req.user?.id ?? null;
        const bulk = permissions.map((p) => ({
          role_id: role.id,
          permission: p,
          created_by: createdBy,
        }));

        await RolePrivilege.bulkCreate(bulk, { transaction: t });
        // await UserRole.findOrCreate({
        //   where: { user_id: req.user!.id, role_id: role.id },
        //   defaults: { user_id: req.user!.id, role_id: role.id },
        //   transaction: t,
        // });

        await t.commit();

        return res
          .status(Enum.HTTP_CODES.CREATED)
          .json(ResponseUtil.successResponse({ id: role.id }));
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);
      const updates: any = req.body;

      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new CustomError(
          Enum.HTTP_CODES.NOT_FOUND,
          "Role Not Found",
          `No role found with ID ${roleId}`
        );
      }

      const t = await sequelize.transaction();

      try {
        const { name, is_active, permissions } = updates;

        if (typeof name === "string" && name.trim()) {
          await role.update({ name: name.trim() }, { transaction: t });
        }

        if (typeof is_active === "boolean") {
          await role.update({ is_active }, { transaction: t });
        }

        if (Array.isArray(permissions)) {
          ensureValidPermissions(permissions);

          const existing = await RolePrivilege.findAll({
            where: { role_id: roleId },
            transaction: t,
          });

          const existingSet = new Set(existing.map((e) => e.permission));
          const incomingSet = new Set(permissions);

          const toRemove = existing
            .filter((e) => !incomingSet.has(e.permission))
            .map((e) => e.id);

          const toAdd = permissions.filter((p) => !existingSet.has(p));

          if (toRemove.length > 0) {
            await RolePrivilege.destroy({
              where: { id: toRemove },
              transaction: t,
            });
          }

          if (toAdd.length > 0) {
            const createdBy = req.user?.id ?? null;
            const rows = toAdd.map((p) => ({
              role_id: roleId,
              permission: p,
              created_by: createdBy,
            }));
            await RolePrivilege.bulkCreate(rows, { transaction: t });
          }
        }

        await t.commit();

        return res
          .status(Enum.HTTP_CODES.OK)
          .json(ResponseUtil.successResponse("Role updated successfully"));
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const roleId = parseInt(req.params.id);

      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new CustomError(
          Enum.HTTP_CODES.NOT_FOUND,
          "Role Not Found",
          `No role found with ID: ${roleId}`
        );
      }

      const t = await sequelize.transaction();

      try {
        await RolePrivilege.destroy({
          where: { role_id: roleId },
          transaction: t,
        });
        await UserRole.destroy({ where: { role_id: roleId }, transaction: t });
        await role.destroy({ transaction: t });

        await t.commit();

        return res
          .status(Enum.HTTP_CODES.OK)
          .json(
            ResponseUtil.successResponse(`Role with ID ${roleId} deleted.`)
          );
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async getPermissions(req: Request, res: Response) {
    try {
      const roleId = Number(req.params.id);
      if (!Number.isFinite(roleId)) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "Invalid role id"
        );
      }

      const role = await Role.findByPk(roleId, { attributes: ["id", "name"] });
      if (!role) {
        throw new CustomError(
          Enum.HTTP_CODES.NOT_FOUND,
          "Role Not Found",
          `No role found with ID ${roleId}`
        );
      }

      const rows = await RolePrivilege.findAll({
        where: { role_id: roleId },
        attributes: ["permission"],
      });
      const permissions = rows.map((r: any) => r.permission);

      return res
        .status(Enum.HTTP_CODES.OK)
        .json(
          ResponseUtil.successResponse({
            roleId,
            name: (role as any).name,
            permissions,
          })
        );
    } catch (err) {
      const error = ResponseUtil.errorResponse(err);
      return res.status(error.code).json(error);
    }
  },

  async patchPermissions(req: Request, res: Response) {
    try {
      const roleId = Number(req.params.id);
      if (!Number.isFinite(roleId)) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "Invalid role id"
        );
      }

      const body = req.body as { add?: string[]; remove?: string[] };
      const add = Array.isArray(body?.add) ? body.add : [];
      const remove = Array.isArray(body?.remove) ? body.remove : [];

      if (add.length === 0 && remove.length === 0) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "Provide at least one of `add` or `remove` arrays"
        );
      }

      // Rol var mı?
      const role = await Role.findByPk(roleId);
      if (!role) {
        throw new CustomError(
          Enum.HTTP_CODES.NOT_FOUND,
          "Role Not Found",
          `No role found with ID ${roleId}`
        );
      }

      // Geçerli permission’lar mı?
      ensureValidPermissions([...add, ...remove]);

      // Mevcut izinleri çek → duplicate eklemeyi engelle
      const existing = await RolePrivilege.findAll({
        where: { role_id: roleId },
        attributes: ["permission"],
      });
      const existingSet = new Set(existing.map((e: any) => e.permission));

      const toAdd = add.filter((p) => !existingSet.has(p));

      // remove’da olmayanları kaldırmaya çalışmayalım (raporlama için)
      const toRemove = remove.filter((p) => existingSet.has(p));

      const t = await sequelize.transaction();
      try {
        if (toAdd.length) {
          const createdBy = req.user?.id ?? null;
          await RolePrivilege.bulkCreate(
            toAdd.map((p) => ({
              role_id: roleId,
              permission: p,
              created_by: createdBy,
            })),
            { transaction: t }
          );
        }

        if (toRemove.length) {
          await RolePrivilege.destroy({
            where: { role_id: roleId, permission: toRemove },
            transaction: t,
          });
        }

        await t.commit();

        // Son durum
        const finalRows = await RolePrivilege.findAll({
          where: { role_id: roleId },
          attributes: ["permission"],
        });
        const finalPermissions = finalRows.map((r: any) => r.permission);

        return res.status(Enum.HTTP_CODES.OK).json(
          ResponseUtil.successResponse({
            added: toAdd,
            removed: toRemove,
            finalPermissions,
          })
        );
      } catch (err) {
        await t.rollback();
        throw err;
      }
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },
};

export default roleController;
