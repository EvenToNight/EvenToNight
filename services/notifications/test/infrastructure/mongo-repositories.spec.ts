jest.mock(
  "../../src/notifications/infrastructure/persistence/mongodb/schemas/notification.schema",
  () => ({
    NotificationModel: {
      create: jest.fn(),
      find: jest.fn(),
      countDocuments: jest.fn(),
      updateOne: jest.fn(),
      updateMany: jest.fn(),
    },
  }),
);
jest.mock(
  "../../src/notifications/infrastructure/persistence/mongodb/schemas/follow.schema",
  () => ({
    FollowModel: {
      create: jest.fn(),
      find: jest.fn(),
      deleteOne: jest.fn(),
    },
  }),
);

import { MongoNotificationRepository } from "../../src/notifications/infrastructure/persistence/mongodb/repositories/mongo-notification.repository";
import { MongoFollowRepository } from "../../src/notifications/infrastructure/persistence/mongodb/repositories/mongo-follow.repository";
import { NotificationModel } from "../../src/notifications/infrastructure/persistence/mongodb/schemas/notification.schema";
import { FollowModel } from "../../src/notifications/infrastructure/persistence/mongodb/schemas/follow.schema";
import { Notification } from "../../src/notifications/domain/aggregates/notification.aggregate";
import { Follow } from "../../src/notifications/domain/aggregates/follow.aggregate";
import { NotificationType } from "../../src/notifications/domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../src/notifications/domain/value-objects/notification-content.vo";
import { UserId } from "../../src/notifications/domain/value-objects/user-id.vo";

const NM = NotificationModel as unknown as Record<string, jest.Mock>;
const FM = FollowModel as unknown as Record<string, jest.Mock>;

const execChain = (value: any) => ({
  sort: jest.fn().mockReturnThis(),
  skip: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  exec: jest.fn().mockResolvedValue(value),
});

beforeEach(() => jest.clearAllMocks());
beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => undefined);
});

describe("MongoNotificationRepository", () => {
  const repo = new MongoNotificationRepository();
  const aNotification = () =>
    Notification.create({
      userId: UserId.fromString("u1"),
      type: NotificationType.LIKE(),
      content: NotificationContent.create({ a: 1 }),
      read: false,
    });

  it("persists a notification via the model", async () => {
    NM.create.mockResolvedValue(undefined);
    await repo.save(aNotification());
    expect(NM.create).toHaveBeenCalledTimes(1);
  });

  it("finds notifications, mapping documents to domain entities", async () => {
    const doc = {
      _id: "n1",
      userId: "u1",
      type: "like",
      metadata: {},
      read: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    NM.find.mockReturnValue(execChain([doc]));
    const result = await repo.findNotificationsByUserId("u1", 10, 0, true);
    expect(NM.find).toHaveBeenCalledWith({ userId: "u1", read: false });
    expect(result).toHaveLength(1);
    expect(result[0].id.toString()).toBe("n1");
  });

  it("counts notifications", async () => {
    NM.countDocuments.mockReturnValue({
      exec: jest.fn().mockResolvedValue(7),
    });
    expect(await repo.countNotificationsByUserId("u1", false)).toBe(7);
  });

  it("marks one and all notifications as read", async () => {
    NM.updateOne.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined),
    });
    NM.updateMany.mockReturnValue({
      exec: jest.fn().mockResolvedValue(undefined),
    });
    await repo.markAsRead("n1");
    await repo.markAllAsReadByUserId("u1");
    expect(NM.updateOne).toHaveBeenCalledWith(
      { _id: "n1" },
      { $set: { read: true } },
    );
    expect(NM.updateMany).toHaveBeenCalled();
  });
});

describe("MongoFollowRepository", () => {
  const repo = new MongoFollowRepository();
  const aFollow = () =>
    Follow.create({
      followerId: UserId.fromString("a"),
      followedId: UserId.fromString("b"),
    });

  it("saves a follow", async () => {
    FM.create.mockResolvedValue(undefined);
    await repo.save(aFollow());
    expect(FM.create).toHaveBeenCalledTimes(1);
  });

  it("translates a duplicate-key error into a domain error", async () => {
    FM.create.mockRejectedValue({ code: 11000 });
    await expect(repo.save(aFollow())).rejects.toThrow(
      "Follow relationship already exists",
    );
  });

  it("rethrows other persistence errors", async () => {
    FM.create.mockRejectedValue(new Error("disk full"));
    await expect(repo.save(aFollow())).rejects.toThrow("disk full");
  });

  it("finds followers and maps them to domain entities", async () => {
    FM.find.mockResolvedValue([
      { _id: "f1", followerId: "a", followedId: "b", createdAt: new Date() },
    ]);
    const result = await repo.findFollowersByUserId(UserId.fromString("b"));
    expect(FM.find).toHaveBeenCalledWith({ followedId: "b" });
    expect(result[0].followerId.toString()).toBe("a");
  });

  it("deletes a follow relation", async () => {
    FM.deleteOne.mockResolvedValue({ deletedCount: 1 });
    await repo.delete(UserId.fromString("a"), UserId.fromString("b"));
    expect(FM.deleteOne).toHaveBeenCalledWith({
      followerId: "a",
      followedId: "b",
    });
  });

  it("throws when nothing was deleted", async () => {
    FM.deleteOne.mockResolvedValue({ deletedCount: 0 });
    await expect(
      repo.delete(UserId.fromString("a"), UserId.fromString("b")),
    ).rejects.toThrow("Follow relationship not found");
  });
});
