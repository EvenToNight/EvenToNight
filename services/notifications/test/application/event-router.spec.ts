import { EventRouter } from "../../src/notifications/application/routers/event-router";

describe("EventRouter", () => {
  const build = () => {
    const createNotificationHandler = {
      execute: jest.fn().mockResolvedValue("id"),
    };
    const processFollowHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const processMessageHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const processUnfollowHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const processEventCreatedHandler = {
      execute: jest.fn().mockResolvedValue(undefined),
    };
    const router = new EventRouter(
      createNotificationHandler as any,
      processFollowHandler as any,
      processMessageHandler as any,
      processUnfollowHandler as any,
      processEventCreatedHandler as any,
    );
    return {
      router,
      createNotificationHandler,
      processFollowHandler,
      processMessageHandler,
      processUnfollowHandler,
      processEventCreatedHandler,
    };
  };

  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "warn").mockImplementation(() => undefined);
  });

  it("routes like/review events through the notification handler", async () => {
    const ctx = build();
    await ctx.router.route("interactions.like.created", {
      creatorId: "a",
      userId: "b",
    });
    expect(ctx.createNotificationHandler.execute).toHaveBeenCalledTimes(1);
  });

  it("skips the notification handler when the mapper returns null", async () => {
    const ctx = build();
    await ctx.router.route("interactions.like.created", {
      creatorId: "same",
      userId: "same",
    });
    expect(ctx.createNotificationHandler.execute).not.toHaveBeenCalled();
  });

  it("routes follow, unfollow, message and event.published to their handlers", async () => {
    const ctx = build();
    await ctx.router.route("interactions.follow.created", {});
    await ctx.router.route("interactions.follow.deleted", {});
    await ctx.router.route("chat.message.created", {});
    await ctx.router.route("event.published", {});

    expect(ctx.processFollowHandler.execute).toHaveBeenCalledTimes(1);
    expect(ctx.processUnfollowHandler.execute).toHaveBeenCalledTimes(1);
    expect(ctx.processMessageHandler.execute).toHaveBeenCalledTimes(1);
    expect(ctx.processEventCreatedHandler.execute).toHaveBeenCalledTimes(1);
  });

  it("does nothing for an unknown routing key", async () => {
    const ctx = build();
    await ctx.router.route("totally.unknown", {});
    expect(ctx.createNotificationHandler.execute).not.toHaveBeenCalled();
    expect(ctx.processFollowHandler.execute).not.toHaveBeenCalled();
  });
});
