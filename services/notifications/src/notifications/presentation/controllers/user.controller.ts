import { Request, Response, NextFunction } from "express";
import { IsOnlineHandler } from "../../application/handlers/is-online.handler";

export class UserController {
  constructor(private readonly isOnlineHandler: IsOnlineHandler) {}

  async isOnline(req: Request, res: Response, next: NextFunction) {
    try {
      const { userId } = req.params;

      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }

      console.log(`🔍 Checking online status for user: ${userId}`);
      const isOnline = this.isOnlineHandler.execute(userId);
      console.log(`✅ User ${userId} online status: ${isOnline}`);

      res.json({
        userId,
        isOnline,
      });
    } catch (error) {
      next(error);
    }
  }
}
