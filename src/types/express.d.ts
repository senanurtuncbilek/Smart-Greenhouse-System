import "express";

declare global {
  namespace Express {
    interface UserPayload {
      id: number;
      email: string;
      roles?: string[];
      permissions?: string[];
    }

    interface Request {
      user?: UserPayload;
    }
  }
}

export {};
