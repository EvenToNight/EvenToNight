import { Request, Response, NextFunction } from "express";
import { GetNotificationsQuery } from "../../application/queries/get-notifications.query";
import { GetNotificationsHandler } from "../../application/handlers/get-notifications.handler";
import { MarkAsReadHandler } from "../../application/handlers/mark-as-read.handler";
import { GetUnreadCountHandler } from "../../application/handlers/get-unread-count.handler";
import { MarkAllAsReadHandler } from "notifications/application/handlers/mark-all-as-read.handler";

export class NotificationController {
  constructor(
    private readonly getNotificationsHandler: GetNotificationsHandler,
    private readonly getUnreadCountHandler: GetUnreadCountHandler,
    private readonly markAsReadHandler: MarkAsReadHandler,
    private readonly markAllAsReadHandler: MarkAllAsReadHandler,
  ) {}

  async getNotificationsByUserId(
    req: Request,
    res: Response,
    next: NextFunction,
  ) {
    try {
      const userId = req.userId;
      const { limit = 20, offset = 0, unreadOnly = false } = req.query;

      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const query = new GetNotificationsQuery(
        userId,
        Number(limit),
        Number(offset),
        Boolean(unreadOnly),
      );

      const notifications = await this.getNotificationsHandler.execute(query);

      res.json({
        notifications,
      });
    } catch (error) {
      next(error);
    }
  }

  async getUnreadCount(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      const countDTO = await this.getUnreadCountHandler.execute(userId);

      res.json(countDTO);
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const { id } = req.params;
      await this.markAsReadHandler.execute(id);

      res.json({
        success: true,
        message: "Notification marked as read",
      });
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: "Unauthorized" });
      }
      await this.markAllAsReadHandler.execute(userId);

      res.json({
        success: true,
        message: "All notifications marked as read",
      });
    } catch (error) {
      next(error);
    }
  }
}
