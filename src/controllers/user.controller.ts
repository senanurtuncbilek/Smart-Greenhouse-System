import { Request, Response } from "express";
import Users from "../db/models/Users";
import ResponseUtil from "../utils/Response";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";
import { Role, UserRole } from "../db/models";
import sequelize from "../db/sequelize";
import bcrypt from "bcrypt";

const saltRounds = 10;

const userController = {
  async list(req: Request, res: Response) {
    try {
      const users = await Users.findAll({});
      res.json(ResponseUtil.successResponse(users));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async register(req: Request, res: Response) {
    const body = req.body;

    try {
      await Users.validateRegisterFields(body);

      const existingUser = await Users.findOne({
        where: { email: body.email },
      });

      if (existingUser) {
        throw new CustomError(
          Enum.HTTP_CODES.CONFLICT,
          "Registration Error",
          "A user with this email already exists"
        );
      }
      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(body.password, salt);

      body.password = hash;
      const createdUser = await Users.create(body);

      return res
        .status(Enum.HTTP_CODES.CREATED)
        .json(ResponseUtil.successResponse(createdUser));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async add(req: Request, res: Response) {
    const body = req.body;

    try {
      await Users.validateRegisterFields(body);

      const salt = await bcrypt.genSalt(saltRounds);
      const hash = await bcrypt.hash(body.password, salt);

      body.password = hash;
      const createdUser = await Users.create(body);

      return res
        .status(Enum.HTTP_CODES.CREATED)
        .json(ResponseUtil.successResponse(createdUser));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async update(req: Request, res: Response) {
    try {
      const userId = req.params.id;
      const updates: any = req.body;

      const user = await Users.findByPk(userId);
      if (!user) {
        throw new CustomError(
          Enum.HTTP_CODES.NOT_FOUND,
          "User Not Found",
          `No user found with ID ${userId}`
        );
      }
      await Users.validateUpdateFields(req.body);
      if (updates.password) {
        const salt = await bcrypt.genSalt(saltRounds);
        updates.password = await bcrypt.hash(updates.password, salt);
      }

      await user.update(updates);

      return res
        .status(Enum.HTTP_CODES.OK)
        .json(ResponseUtil.successResponse("User updated successfully"));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const userId = req.params.id;

      const user = await Users.findByPk(userId);
      if (!user) {
        throw new CustomError(
          Enum.HTTP_CODES.NOT_FOUND,
          "User Not Found",
          `No user found with ID: ${userId}`
        );
      }

      await user.destroy();

      return res
        .status(Enum.HTTP_CODES.OK)
        .json(ResponseUtil.successResponse(`User with ID ${userId} deleted.`));
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },
  async assignRoles(req: Request, res: Response) {
    try {
      const userId = Number(req.params.id);
      if (!Number.isFinite(userId)) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "Invalid user id"
        );
      }

      // Body: { roles: number[] }  (tam set/idempotent)
      const body = req.body as { roles?: Array<number | string> };
      if (!body || !Array.isArray(body.roles)) {
        throw new CustomError(
          Enum.HTTP_CODES.BAD_REQUEST,
          "Validation Error",
          "`roles` must be an array of role ids"
        );
      }

      // Dizi -> sayılara çevir, tekilleştir
      const incomingIds = Array.from(
        new Set(
          body.roles.map((r) => Number(r)).filter((n) => Number.isFinite(n))
        )
      );

      // Kullanıcı var mı?
      const user = await Users.findByPk(userId);
      if (!user) {
        throw new CustomError(
          Enum.HTTP_CODES.NOT_FOUND,
          "User Not Found",
          `No user found with ID ${userId}`
        );
      }

      if (incomingIds.length > 0) {
        const found = await Role.findAll({
          where: { id: incomingIds },
          attributes: ["id", "name"],
        });
        const foundIds = new Set(found.map((r: any) => r.id));
        const unknown = incomingIds.filter((id) => !foundIds.has(id));
        if (unknown.length) {
          throw new CustomError(
            Enum.HTTP_CODES.BAD_REQUEST,
            "Validation Error",
            `Unknown role id(s): ${unknown.join(", ")}`
          );
        }
      }

      const existing = await UserRole.findAll({
        where: { user_id: userId },
        attributes: ["role_id"],
      });
      const existingIds = new Set(existing.map((e: any) => e.role_id));

      const toAdd = incomingIds.filter((id) => !existingIds.has(id));
      const toRemove = [...existingIds].filter(
        (id) => !incomingIds.includes(id)
      );

      const t = await sequelize.transaction();
      try {
        if (toRemove.length) {
          await UserRole.destroy({
            where: { user_id: userId, role_id: toRemove },
            transaction: t,
          });
        }

        if (toAdd.length) {
          const rows = toAdd.map((rid) => ({
            user_id: userId,
            role_id: rid,
            created_by: req.user?.id ?? null,
          }));
          await UserRole.bulkCreate(rows, { transaction: t });
        }

        await t.commit();

        // Final roller
        const finalUserRoles = await UserRole.findAll({
          where: { user_id: userId },
          attributes: ["role_id"],
        });
        const finalRoles = finalUserRoles.map((r: any) => r.role_id);

        return res.status(Enum.HTTP_CODES.OK).json(
          ResponseUtil.successResponse({
            added: toAdd,
            removed: toRemove,
            finalRoles,
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

export default userController;
