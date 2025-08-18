import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import config from "../config";
import CustomError from "../utils/Error";
import ResponseUtil from "../utils/Response";
import Enum from "../config/Enum";

type AccessPayload = JwtPayload & {
  id: number;
  email: string;
};

// pull token from header
function extractToken(req: Request): string | null {
  const header = req.headers.authorization;
  if (header && header.startsWith("Bearer ")) return header.split(" ")[1];
  return null;
}

// token validate
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = extractToken(req);
  

  try {
    if (!token)
    throw new CustomError(
      Enum.HTTP_CODES.UNAUTHORIZED,
      "Unauthorized",
      "Token missing or invalid"
    );
    const payload = jwt.verify(token, config.JWT.SECRET, {algorithms: ["HS256"]}) as AccessPayload;

    req.user = {
      id: payload.id,
      email: payload.email
    };
    return next();
  } catch (err) {
    const response = ResponseUtil.errorResponse(err);
    return res.status(response.code).json(response);
  }
};
