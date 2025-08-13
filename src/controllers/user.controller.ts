import { Request, Response } from "express";
import Users from "../db/models/Users";
import ResponseUtil from "../utils/Response";
import CustomError from "../utils/Error";
import Enum from "../config/Enum";

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
};

export default userController;
