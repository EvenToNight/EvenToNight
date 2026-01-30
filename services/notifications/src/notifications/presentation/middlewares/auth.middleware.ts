import { Request, Response, NextFunction } from "express";
import { JwtService } from "../../../config/jwt.config";
import { config } from "../../../config/env.config";

export function createAuthMiddleware(options: { optional?: boolean } = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    void authenticateRequest(req, res, next, options);
  };
}

async function authenticateRequest(
  req: Request,
  res: Response,
  next: NextFunction,
  options: { optional?: boolean } = {},
): Promise<void> {
  if (!config.jwtAuthPublicKeyUrl) {
    next();
    return;
  }

  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.replace("Bearer ", "")
    : null;

  if (!token) {
    if (options.optional) {
      next();
      return;
    }
    res.status(401).json({ error: "No token provided" });
    return;
  }

  try {
    const payload = await JwtService.verifyToken(token);

    if (!payload || !payload.user_id) {
      if (options.optional) {
        next();
        return;
      }
      res.status(401).json({ error: "Invalid token" });
      return;
    }

    req.userId = payload.user_id;
    next();
  } catch (error) {
    console.error("JWT verification error:", error);
    if (options.optional) {
      next();
      return;
    }
    res.status(401).json({ error: "Authentication failed" });
  }
}

export const authMiddleware = createAuthMiddleware();
export const optionalAuthMiddleware = createAuthMiddleware({ optional: true });
