import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export function createNotificationRoutes(
  _controller: NotificationController,
): Router {
  const router = Router();
  router.use(authMiddleware);
  return router;
}
