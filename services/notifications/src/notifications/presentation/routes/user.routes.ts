import { Router } from "express";
import { UserController } from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";

export function createUserRoutes(controller: UserController): Router {
  const router = Router();
  router.use(authMiddleware);

  router.get("/:userId/is-online", (req, res, next) => {
    void controller.isOnline(req, res, next);
  });

  return router;
}
