// req.user
import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      email: string;
      roles?: string[];
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
