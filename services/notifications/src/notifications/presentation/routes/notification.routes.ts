import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";

export function createNotificationRoutes(
  _controller: NotificationController,
): Router {
  const router = Router();
  return router;
}
