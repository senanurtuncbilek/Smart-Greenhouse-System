import rateLimit, { ipKeyGenerator } from "express-rate-limit";
import type { Request, Response, NextFunction } from "express";

function rateLimitHandler(req: Request, res: Response, _next: NextFunction) {
  const windowSec = 60;
  res.status(429).json({
    code: "RATE_LIMITED",
    message: "Too many requests. Please try again later.",
    retryAfterSeconds: windowSec,
    details: { limit: undefined, windowSeconds: windowSec },
    traceId: (req as any).traceId || undefined,
  });
}

const safeIp = (req: Request) =>
  (typeof req.ip === "string" && req.ip) ||
  (req.socket &&
    typeof req.socket.remoteAddress === "string" &&
    req.socket.remoteAddress) ||
  "0.0.0.0";

// 1) LOGIN
export const loginLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_LOGIN_WINDOW ?? 60) * 1000,
  max: Number(process.env.RATE_LIMIT_LOGIN_MAX ?? 5),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => ipKeyGenerator(safeIp(req)),
});

// 2) REFRESH
export const refreshLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => ipKeyGenerator(safeIp(req)),
});

// 3) WRITE
export const writeLimiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WRITE_WINDOW ?? 60) * 1000,
  max: Number(process.env.RATE_LIMIT_WRITE_MAX ?? 60),
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skip: (req) =>
    req.method === "GET" ||
    req.method === "OPTIONS" ||
    req.path.startsWith("/api/docs"),
  keyGenerator: (req: any) => {
    const userId = req.user?.id ?? req.user?._id;
    return userId ? `user:${userId}` : ipKeyGenerator(safeIp(req));
  },
});
