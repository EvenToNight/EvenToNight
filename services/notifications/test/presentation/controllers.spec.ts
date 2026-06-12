import { NotificationController } from "../../src/notifications/presentation/controllers/notification.controller";
import { UserController } from "../../src/notifications/presentation/controllers/user.controller";

const resMock = () => {
  const res: any = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => undefined);
});

describe("NotificationController", () => {
  const build = () => {
    const getNotificationsHandler = {
      execute: jest.fn().mockResolvedValue({ notifications: [], total: 0 }),
    };
    const getUnreadCountHandler = {
      execute: jest.fn().mockResolvedValue({ count: 5 }),
    };
    const markAsReadHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const markAllAsReadHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const controller = new NotificationController(
      getNotificationsHandler as any,
      getUnreadCountHandler as any,
      markAsReadHandler as any,
      markAllAsReadHandler as any,
    );
    return {
      controller,
      getNotificationsHandler,
      getUnreadCountHandler,
      markAsReadHandler,
      markAllAsReadHandler,
    };
  };

  describe("getNotificationsByUserId", () => {
    it("returns notifications for an authenticated user", async () => {
      const ctx = build();
      const req: any = { userId: "u1", query: {} };
      const res = resMock();
      await ctx.controller.getNotificationsByUserId(req, res, jest.fn());
      expect(ctx.getNotificationsHandler.execute).toHaveBeenCalledTimes(1);
      expect(res.json).toHaveBeenCalledWith({
        notifications: { notifications: [], total: 0 },
      });
    });

    it("responds 401 when there is no userId", async () => {
      const ctx = build();
      const req: any = { query: {} };
      const res = resMock();
      await ctx.controller.getNotificationsByUserId(req, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
      expect(ctx.getNotificationsHandler.execute).not.toHaveBeenCalled();
    });

    it("forwards errors to next", async () => {
      const ctx = build();
      const error = new Error("boom");
      ctx.getNotificationsHandler.execute.mockRejectedValue(error);
      const next = jest.fn();
      await ctx.controller.getNotificationsByUserId(
        { userId: "u1", query: {} } as any,
        resMock(),
        next,
      );
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUnreadCount", () => {
    it("returns the unread count", async () => {
      const ctx = build();
      const res = resMock();
      await ctx.controller.getUnreadCount(
        { userId: "u1" } as any,
        res,
        jest.fn(),
      );
      expect(res.json).toHaveBeenCalledWith({ count: 5 });
    });

    it("responds 401 without a userId", async () => {
      const ctx = build();
      const res = resMock();
      await ctx.controller.getUnreadCount({} as any, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });

  describe("markAsRead", () => {
    it("marks a notification as read", async () => {
      const ctx = build();
      const res = resMock();
      await ctx.controller.markAsRead(
        { params: { id: "n1" } } as any,
        res,
        jest.fn(),
      );
      expect(ctx.markAsReadHandler.execute).toHaveBeenCalledWith("n1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
      );
    });
  });

  describe("markAllAsRead", () => {
    it("marks all as read for an authenticated user", async () => {
      const ctx = build();
      const res = resMock();
      await ctx.controller.markAllAsRead(
        { userId: "u1" } as any,
        res,
        jest.fn(),
      );
      expect(ctx.markAllAsReadHandler.execute).toHaveBeenCalledWith("u1");
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true }),
      );
    });

    it("responds 401 without a userId", async () => {
      const ctx = build();
      const res = resMock();
      await ctx.controller.markAllAsRead({} as any, res, jest.fn());
      expect(res.status).toHaveBeenCalledWith(401);
    });
  });
});

describe("UserController", () => {
  const build = () => {
    const isOnlineHandler = { execute: jest.fn().mockReturnValue(true) };
    return {
      isOnlineHandler,
      controller: new UserController(isOnlineHandler as any),
    };
  };

  it("returns the online status of a user", () => {
    const ctx = build();
    const res = resMock();
    ctx.controller.isOnline(
      { params: { userId: "u1" } } as any,
      res,
      jest.fn(),
    );
    expect(ctx.isOnlineHandler.execute).toHaveBeenCalledWith("u1");
    expect(res.json).toHaveBeenCalledWith({ userId: "u1", isOnline: true });
  });

  it("responds 400 when userId is missing", () => {
    const ctx = build();
    const res = resMock();
    ctx.controller.isOnline({ params: {} } as any, res, jest.fn());
    expect(res.status).toHaveBeenCalledWith(400);
    expect(ctx.isOnlineHandler.execute).not.toHaveBeenCalled();
  });

  it("forwards errors to next", () => {
    const ctx = build();
    const error = new Error("boom");
    ctx.isOnlineHandler.execute.mockImplementation(() => {
      throw error;
    });
    const next = jest.fn();
    ctx.controller.isOnline(
      { params: { userId: "u1" } } as any,
      resMock(),
      next,
    );
    expect(next).toHaveBeenCalledWith(error);
  });
});
