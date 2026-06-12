import {
  NotificationType,
  NotificationTypeEnum,
} from "../../src/notifications/domain/value-objects/notification-type.vo";
import { NotificationId } from "../../src/notifications/domain/value-objects/notification-id.vo";
import { NotificationContent } from "../../src/notifications/domain/value-objects/notification-content.vo";
import { UserId } from "../../src/notifications/domain/value-objects/user-id.vo";
import { FollowId } from "../../src/notifications/domain/value-objects/follow-id.vo";

describe("NotificationType", () => {
  it("builds from a valid string regardless of case", () => {
    expect(NotificationType.fromString("message").toString()).toBe("message");
    expect(NotificationType.fromString("LIKE").toString()).toBe("like");
    expect(NotificationType.fromString("New_Event").toString()).toBe(
      NotificationTypeEnum.NEW_EVENT,
    );
  });

  it("throws on an unknown type", () => {
    expect(() => NotificationType.fromString("unknown")).toThrow(
      "Invalid notification type: unknown",
    );
  });

  it("exposes static factories for each type", () => {
    expect(NotificationType.MESSAGE().toString()).toBe("message");
    expect(NotificationType.LIKE().toString()).toBe("like");
    expect(NotificationType.FOLLOW().toString()).toBe("follow");
    expect(NotificationType.REVIEW().toString()).toBe("review");
    expect(NotificationType.NEW_EVENT().toString()).toBe("new_event");
  });

  it("compares by value with equals", () => {
    expect(NotificationType.MESSAGE().equals(NotificationType.MESSAGE())).toBe(
      true,
    );
    expect(NotificationType.MESSAGE().equals(NotificationType.LIKE())).toBe(
      false,
    );
  });
});

describe("NotificationId", () => {
  it("wraps a non-empty value", () => {
    expect(NotificationId.fromString("abc").toString()).toBe("abc");
  });

  it("throws when empty or blank", () => {
    expect(() => NotificationId.fromString("")).toThrow(
      "NotificationId cannot be empty",
    );
    expect(() => NotificationId.fromString("   ")).toThrow(
      "NotificationId cannot be empty",
    );
  });

  it("generates unique ids", () => {
    const a = NotificationId.generate();
    const b = NotificationId.generate();
    expect(a.toString()).not.toBe(b.toString());
  });

  it("compares by value with equals", () => {
    expect(
      NotificationId.fromString("x").equals(NotificationId.fromString("x")),
    ).toBe(true);
    expect(
      NotificationId.fromString("x").equals(NotificationId.fromString("y")),
    ).toBe(false);
  });
});

describe("NotificationContent", () => {
  it("stores metadata and returns a copy from the getter", () => {
    const meta = { foo: "bar" };
    const content = NotificationContent.create(meta);
    expect(content.metadata).toEqual({ foo: "bar" });
    expect(content.metadata).not.toBe(meta);
    expect(content.toJson()).toEqual({ foo: "bar" });
  });

  it("throws when metadata is not an object", () => {
    expect(() => NotificationContent.create(null as any)).toThrow(
      "Notification metadata must be an object",
    );
    expect(() => NotificationContent.create(123 as any)).toThrow(
      "Notification metadata must be an object",
    );
  });
});

describe("UserId", () => {
  it("wraps a non-empty value and compares by value", () => {
    expect(UserId.fromString("u1").toString()).toBe("u1");
    expect(UserId.fromString("u1").equals(UserId.fromString("u1"))).toBe(true);
    expect(UserId.fromString("u1").equals(UserId.fromString("u2"))).toBe(false);
  });

  it("throws when empty", () => {
    expect(() => UserId.fromString("")).toThrow("UserId cannot be empty");
  });
});

describe("FollowId", () => {
  it("wraps a value, generates unique ids and compares by value", () => {
    expect(FollowId.fromString("f1").toString()).toBe("f1");
    expect(FollowId.generate().toString()).not.toBe(
      FollowId.generate().toString(),
    );
    expect(FollowId.fromString("f1").equals(FollowId.fromString("f1"))).toBe(
      true,
    );
    expect(FollowId.fromString("f1").equals(FollowId.fromString("f2"))).toBe(
      false,
    );
  });

  it("throws when empty", () => {
    expect(() => FollowId.fromString("")).toThrow("FollowId cannot be empty");
  });
});
