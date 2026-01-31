import express, { Application, Request, Response, Router } from "express";
import cors from "cors";

export const createApp = (notificationRoutes: Router): Application => {
  const app = express();

  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  app.use(express.json());

  app.get("/health", (req: Request, res: Response) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  app.use("/", notificationRoutes);

  return app;
};
