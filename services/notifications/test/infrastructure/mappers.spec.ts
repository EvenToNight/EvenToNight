import { NotificationMapper } from "../../src/notifications/infrastructure/persistence/mongodb/mappers/notification.mapper";
import { FollowMapper } from "../../src/notifications/infrastructure/persistence/mongodb/mappers/follow.mapper";
import { Notification } from "../../src/notifications/domain/aggregates/notification.aggregate";
import { Follow } from "../../src/notifications/domain/aggregates/follow.aggregate";
import { NotificationType } from "../../src/notifications/domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../src/notifications/domain/value-objects/notification-content.vo";
import { UserId } from "../../src/notifications/domain/value-objects/user-id.vo";

describe("NotificationMapper", () => {
  it("maps a domain entity to a persistence document", () => {
    const createdAt = new Date("2023-01-01T00:00:00Z");
    const notification = Notification.create({
      userId: UserId.fromString("u1"),
      type: NotificationType.LIKE(),
      content: NotificationContent.create({ eventId: "e1" }),
      read: false,
      createdAt,
      updatedAt: createdAt,
    });

    const doc = NotificationMapper.toPersistence(notification);

    expect(doc).toMatchObject({
      _id: notification.id.toString(),
      userId: "u1",
      type: "like",
      metadata: { eventId: "e1" },
      read: false,
      createdAt,
      updatedAt: createdAt,
    });
  });

  it("maps a persistence document back to a domain entity", () => {
    const createdAt = new Date("2023-01-01T00:00:00Z");
    const entity = NotificationMapper.toDomain({
      _id: "id-1",
      userId: "u9",
      type: "review",
      metadata: { k: "v" },
      read: true,
      createdAt,
      updatedAt: createdAt,
    } as any);

    expect(entity.id.toString()).toBe("id-1");
    expect(entity.userId.toString()).toBe("u9");
    expect(entity.type.toString()).toBe("review");
    expect(entity.content.metadata).toEqual({ k: "v" });
    expect(entity.isRead).toBe(true);
  });
});

describe("FollowMapper", () => {
  it("maps a follow to a persistence document", () => {
    const createdAt = new Date("2023-02-02T00:00:00Z");
    const follow = Follow.create({
      followerId: UserId.fromString("a"),
      followedId: UserId.fromString("b"),
      createdAt,
    });

    const doc = FollowMapper.toPersistence(follow);

    expect(doc).toEqual({ followerId: "a", followedId: "b", createdAt });
  });

  it("maps a persistence document back to a follow", () => {
    const createdAt = new Date("2023-02-02T00:00:00Z");
    const follow = FollowMapper.toDomain({
      _id: "follow-1",
      followerId: "a",
      followedId: "b",
      createdAt,
    } as any);

    expect(follow.id.toString()).toBe("follow-1");
    expect(follow.followerId.toString()).toBe("a");
    expect(follow.followedId.toString()).toBe("b");
  });
});
