import { Notification } from "../../src/notifications/domain/aggregates/notification.aggregate";
import { Follow } from "../../src/notifications/domain/aggregates/follow.aggregate";
import { NotificationId } from "../../src/notifications/domain/value-objects/notification-id.vo";
import { NotificationType } from "../../src/notifications/domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../src/notifications/domain/value-objects/notification-content.vo";
import { UserId } from "../../src/notifications/domain/value-objects/user-id.vo";
import { FollowId } from "../../src/notifications/domain/value-objects/follow-id.vo";

describe("Notification aggregate", () => {
  const props = () => ({
    userId: UserId.fromString("user-1"),
    type: NotificationType.LIKE(),
    content: NotificationContent.create({ eventId: "e1" }),
    read: false,
  });

  it("creates with a generated id and default timestamps", () => {
    const n = Notification.create(props());
    expect(n.id.toString()).toBeTruthy();
    expect(n.userId.toString()).toBe("user-1");
    expect(n.type.toString()).toBe("like");
    expect(n.isRead).toBe(false);
    expect(n.createdAt).toBeInstanceOf(Date);
    expect(n.updatedAt).toBeInstanceOf(Date);
  });

  it("rebuilds from persistence keeping the given id", () => {
    const id = NotificationId.fromString("persisted-id");
    const createdAt = new Date("2020-01-01T00:00:00Z");
    const n = Notification.fromPersistence(id, {
      ...props(),
      read: true,
      createdAt,
      updatedAt: createdAt,
    });
    expect(n.id.toString()).toBe("persisted-id");
    expect(n.isRead).toBe(true);
    expect(n.createdAt).toBe(createdAt);
  });

  it("marks as read", () => {
    const n = Notification.create(props());
    n.markAsRead();
    expect(n.isRead).toBe(true);
  });

  it("serializes to a plain object via toJSON", () => {
    const id = NotificationId.fromString("id-1");
    const createdAt = new Date("2021-05-05T10:00:00Z");
    const n = Notification.fromPersistence(id, {
      userId: UserId.fromString("user-9"),
      type: NotificationType.REVIEW(),
      content: NotificationContent.create({ k: "v" }),
      read: true,
      createdAt,
      updatedAt: createdAt,
    });
    expect(n.toJSON()).toEqual({
      id: "id-1",
      userId: "user-9",
      type: "review",
      metadata: { k: "v" },
      read: true,
      createdAt,
      updatedAt: createdAt,
    });
  });
});

describe("Follow aggregate", () => {
  it("creates a valid follow between two distinct users", () => {
    const f = Follow.create({
      followerId: UserId.fromString("a"),
      followedId: UserId.fromString("b"),
    });
    expect(f.id.toString()).toBeTruthy();
    expect(f.followerId.toString()).toBe("a");
    expect(f.followedId.toString()).toBe("b");
    expect(f.createdAt).toBeInstanceOf(Date);
  });

  it("throws when a user tries to follow themselves", () => {
    expect(() =>
      Follow.create({
        followerId: UserId.fromString("same"),
        followedId: UserId.fromString("same"),
      }),
    ).toThrow("User cannot follow themselves");
  });

  it("rebuilds from persistence and serializes via toJSON", () => {
    const id = FollowId.fromString("follow-1");
    const createdAt = new Date("2022-02-02T00:00:00Z");
    const f = Follow.fromPersistence(id, {
      followerId: UserId.fromString("a"),
      followedId: UserId.fromString("b"),
      createdAt,
    });
    expect(f.toJSON()).toEqual({
      id: "follow-1",
      followerId: "a",
      followedId: "b",
      createdAt,
    });
  });
});
