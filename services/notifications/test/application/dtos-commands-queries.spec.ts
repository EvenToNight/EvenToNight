import { NotificationDto } from "../../src/notifications/application/dto/notification.dto";
import { NotificationListDto } from "../../src/notifications/application/dto/notification-list.dto";
import { UnreadCountDTO } from "../../src/notifications/application/dto/unread-count.dto";
import { CreateNotificationFromEventCommand } from "../../src/notifications/application/commands/create-notification-from-event.command";
import { GetNotificationsQuery } from "../../src/notifications/application/queries/get-notifications.query";
import { GetUnreadCountQuery } from "../../src/notifications/application/queries/get-unread-count.query";
import { Notification } from "../../src/notifications/domain/aggregates/notification.aggregate";
import { NotificationType } from "../../src/notifications/domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../src/notifications/domain/value-objects/notification-content.vo";
import { UserId } from "../../src/notifications/domain/value-objects/user-id.vo";

describe("NotificationDto", () => {
  it("maps from a domain entity and serializes", () => {
    const notification = Notification.create({
      userId: UserId.fromString("u1"),
      type: NotificationType.LIKE(),
      content: NotificationContent.create({ a: 1 }),
      read: true,
    });
    const dto = NotificationDto.fromEntity(notification);
    expect(dto.userId).toBe("u1");
    expect(dto.type).toBe("like");
    expect(dto.metadata).toEqual({ a: 1 });
    expect(dto.read).toBe(true);
    expect(dto.toJson()).toMatchObject({
      userId: "u1",
      type: "like",
      metadata: { a: 1 },
      read: true,
    });
  });
});

describe("NotificationListDto", () => {
  const dto = (id: string) =>
    new NotificationDto(id, "u1", "like", {}, false, new Date(), new Date());

  it("computes hasMore=true when more pages remain", () => {
    const list = NotificationListDto.create([dto("1")], 10, 5, 0);
    expect(list.hasMore).toBe(true);
    expect(list.toJson().pagination).toEqual({
      total: 10,
      limit: 5,
      offset: 0,
      hasMore: true,
    });
  });

  it("computes hasMore=false on the last page", () => {
    const list = NotificationListDto.create([dto("1")], 4, 5, 0);
    expect(list.hasMore).toBe(false);
    expect(list.toJson().data).toHaveLength(1);
  });
});

describe("UnreadCountDTO", () => {
  it("serializes the count", () => {
    expect(new UnreadCountDTO(7).toJSON()).toEqual({ count: 7 });
  });
});

describe("CreateNotificationFromEventCommand", () => {
  it("creates with valid data", () => {
    const cmd = CreateNotificationFromEventCommand.create({
      recipientUserId: "u1",
      type: "like",
      metadata: { x: 1 },
    });
    expect(cmd.type).toBe("like");
    expect(cmd.recipientUserId).toBe("u1");
    expect(cmd.metadata).toEqual({ x: 1 });
  });

  it("throws when the type is missing", () => {
    expect(() =>
      CreateNotificationFromEventCommand.create({
        type: "",
        metadata: {},
      }),
    ).toThrow("Notification type is required");
  });

  it("throws when metadata is not an object", () => {
    expect(() =>
      CreateNotificationFromEventCommand.create({
        type: "like",
        metadata: null as any,
      }),
    ).toThrow("metadata is required and must be an object");
  });
});

describe("GetNotificationsQuery", () => {
  it("applies defaults", () => {
    const q = new GetNotificationsQuery("u1");
    expect(q.limit).toBe(50);
    expect(q.offset).toBe(0);
    expect(q.unreadOnly).toBe(false);
  });

  it("validates userId, limit and offset", () => {
    expect(() => new GetNotificationsQuery("")).toThrow("userId is required");
    expect(() => new GetNotificationsQuery("u1", 0)).toThrow(
      "limit must be between 1 and 100",
    );
    expect(() => new GetNotificationsQuery("u1", 101)).toThrow(
      "limit must be between 1 and 100",
    );
    expect(() => new GetNotificationsQuery("u1", 50, -1)).toThrow(
      "offset cannot be negative",
    );
  });
});

describe("GetUnreadCountQuery", () => {
  it("requires a userId", () => {
    expect(new GetUnreadCountQuery("u1").userId).toBe("u1");
    expect(() => new GetUnreadCountQuery("  ")).toThrow("userId is required");
  });
});
