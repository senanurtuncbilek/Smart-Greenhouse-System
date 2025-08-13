import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";


import CustomError from "../utils/Error";
import ResponseUtil from "../utils/Response";
import Enum from "../config/Enum";
import config from "../config";
import { User, Role } from "../db/models";
import redis from "../utils/Redis";

const authController = {
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const user = await User.findOne({
        where: { email },
        include: [{ model: Role, as: "roles", attributes: ["name"] }], // get associated role name
      });
      if (!user)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Authentication Error",
          "Invalid email or password"
        );

      const isPasswordMatch = await bcrypt.compare(password, user.password);
      if (!isPasswordMatch)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Authentication Error",
          "Invalid email or password"
        );

      const roles = (user as any).roles?.map((r: any) => r.name) ?? [];

      // generate access-refresh token
      const accessToken = jwt.sign(
        { id: user.id, email: user.email, roles },
        config.JWT.SECRET as string,
        { expiresIn: "15m" }
      );

      const refreshToken = jwt.sign(
        { id: user.id },
        config.JWT.REFRESH_SECRET,
        { expiresIn: "7d" }
      );

      await redis.set(`refresh_token:${user.id}`, refreshToken, {
        EX: 7 * 24 * 60 * 60,
      });

      res.cookie("refresh_token", refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000,
      });

      return res.status(Enum.HTTP_CODES.OK).json(
        ResponseUtil.successResponse({
          access_token: accessToken,
        })
      );
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },

  async refresh(req: Request, res: Response) {
    try {
      const token = req.cookies?.refresh_token;
      if (!token)
      throw new CustomError(
        Enum.HTTP_CODES.UNAUTHORIZED,
        "Unauthorized",
        "No refresh token"
      );
      const payload = jwt.verify(token, config.JWT.REFRESH_SECRET) as any;

      const stored = await redis.get(`refresh_token:${payload.id}`);
      if (!stored || stored !== token)
        throw new CustomError(
          Enum.HTTP_CODES.UNAUTHORIZED,
          "Unauthorized",
          "Invalid or revoked refresh token"
        );

      const user = await User.findByPk(payload.id, {
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
      const newAccessToken = jwt.sign(
        { id: user.id, email: user.email, roles },
        config.JWT.SECRET as string,
        { expiresIn: "15m" }
      );
      return res.json({ access_token: newAccessToken });
    } catch (err) {
      const errorResponse = ResponseUtil.errorResponse(err);
      return res.status(errorResponse.code).json(errorResponse);
    }
  },
  async logout(req: Request, res: Response) {
    try {
      const token = req.cookies?.refresh_token;
      if (token) {
        try {
          const payload = jwt.verify(token, config.JWT.REFRESH_SECRET) as any;
          await redis.del(`refresh_token:${payload.id}`);
        } catch (err: any) {
          if (
            err.name === "TokenExpiredError" ||
            err.name === "JsonWebTokenError"
          ) {
          } else {
            throw err; // Throw if there is an unexpected error
          }
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
