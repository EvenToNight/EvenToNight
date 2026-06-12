import { CreateNotificationFromEventHandler } from "../../src/notifications/application/handlers/create-notification-from-event.handler";
import { GetNotificationsHandler } from "../../src/notifications/application/handlers/get-notifications.handler";
import { GetUnreadCountHandler } from "../../src/notifications/application/handlers/get-unread-count.handler";
import { MarkAsReadHandler } from "../../src/notifications/application/handlers/mark-as-read.handler";
import { MarkAllAsReadHandler } from "../../src/notifications/application/handlers/mark-all-as-read.handler";
import { IsOnlineHandler } from "../../src/notifications/application/handlers/is-online.handler";
import { ProcessEventCreatedHandler } from "../../src/notifications/application/handlers/process-event-created.handler";
import { ProcessFollowEventHandler } from "../../src/notifications/application/handlers/process-follow-event.handler";
import { ProcessUnfollowEventHandler } from "../../src/notifications/application/handlers/process-unfollow-event.handler";
import {
  ProcessMessageEventHandler,
  MessageReceivedEvent,
} from "../../src/notifications/application/handlers/process-message-event.handler";
import { CreateNotificationFromEventCommand } from "../../src/notifications/application/commands/create-notification-from-event.command";
import { Notification } from "../../src/notifications/domain/aggregates/notification.aggregate";
import { Follow } from "../../src/notifications/domain/aggregates/follow.aggregate";
import { NotificationType } from "../../src/notifications/domain/value-objects/notification-type.vo";
import { NotificationContent } from "../../src/notifications/domain/value-objects/notification-content.vo";
import { UserId } from "../../src/notifications/domain/value-objects/user-id.vo";

const notificationRepoMock = () => ({
  save: jest.fn().mockResolvedValue(undefined),
  findNotificationsByUserId: jest.fn().mockResolvedValue([]),
  countNotificationsByUserId: jest.fn().mockResolvedValue(0),
  markAsRead: jest.fn().mockResolvedValue(undefined),
  markAllAsReadByUserId: jest.fn().mockResolvedValue(undefined),
});

const followRepoMock = () => ({
  save: jest.fn().mockResolvedValue(undefined),
  findFollowersByUserId: jest.fn().mockResolvedValue([]),
  delete: jest.fn().mockResolvedValue(undefined),
});

const publisherMock = () => ({
  publish: jest.fn().mockResolvedValue(undefined),
  subscribe: jest.fn(),
});

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => undefined);
  jest.spyOn(console, "warn").mockImplementation(() => undefined);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("CreateNotificationFromEventHandler", () => {
  it("returns an empty id without persisting when there is no recipient", async () => {
    const repo = notificationRepoMock();
    const publisher = publisherMock();
    const handler = new CreateNotificationFromEventHandler(repo, publisher);

    const command = CreateNotificationFromEventCommand.create({
      type: "like",
      metadata: { x: 1 },
    });
    const id = await handler.execute(command);

    expect(id).toBe("");
    expect(repo.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it("publishes only (no save) for message notifications", async () => {
    const repo = notificationRepoMock();
    const publisher = publisherMock();
    const handler = new CreateNotificationFromEventHandler(repo, publisher);

    const command = CreateNotificationFromEventCommand.create({
      recipientUserId: "u1",
      type: "message",
      metadata: { text: "hi" },
    });
    const id = await handler.execute(command);

    expect(id).toBeTruthy();
    expect(repo.save).not.toHaveBeenCalled();
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });

  it("saves and publishes for non-message notifications", async () => {
    const repo = notificationRepoMock();
    const publisher = publisherMock();
    const handler = new CreateNotificationFromEventHandler(repo, publisher);

    const command = CreateNotificationFromEventCommand.create({
      recipientUserId: "u1",
      type: "like",
      metadata: { x: 1 },
    });
    const id = await handler.execute(command);

    expect(id).toBeTruthy();
    expect(repo.save).toHaveBeenCalledTimes(1);
    expect(publisher.publish).toHaveBeenCalledTimes(1);
  });
});

describe("GetNotificationsHandler", () => {
  it("returns a paginated list and marks fetched notifications as read", async () => {
    const repo = notificationRepoMock();
    const notification = Notification.create({
      userId: UserId.fromString("u1"),
      type: NotificationType.LIKE(),
      content: NotificationContent.create({}),
      read: false,
    });
    repo.findNotificationsByUserId.mockResolvedValue([notification]);
    repo.countNotificationsByUserId.mockResolvedValue(1);

    const handler = new GetNotificationsHandler(repo);
    const result = await handler.execute({
      userId: "u1",
      limit: 50,
      offset: 0,
      unreadOnly: false,
    } as any);

    expect(result.total).toBe(1);
    expect(result.notifications).toHaveLength(1);
    expect(repo.markAsRead).toHaveBeenCalledWith(notification.id.toString());
  });
});

describe("GetUnreadCountHandler", () => {
  it("counts unread notifications", async () => {
    const repo = notificationRepoMock();
    repo.countNotificationsByUserId.mockResolvedValue(3);
    const handler = new GetUnreadCountHandler(repo);

    const result = await handler.execute("u1");

    expect(result.count).toBe(3);
    expect(repo.countNotificationsByUserId).toHaveBeenCalledWith("u1", true);
  });
});

describe("MarkAsReadHandler / MarkAllAsReadHandler", () => {
  it("marks a single notification as read", async () => {
    const repo = notificationRepoMock();
    await new MarkAsReadHandler(repo).execute("n1");
    expect(repo.markAsRead).toHaveBeenCalledWith("n1");
  });

  it("marks all notifications of a user as read", async () => {
    const repo = notificationRepoMock();
    await new MarkAllAsReadHandler(repo).execute("u1");
    expect(repo.markAllAsReadByUserId).toHaveBeenCalledWith("u1");
  });
});

describe("IsOnlineHandler", () => {
  it("delegates to the gateway", () => {
    const gateway = { isUserConnected: jest.fn().mockReturnValue(true) } as any;
    expect(new IsOnlineHandler(gateway).execute("u1")).toBe(true);
    expect(gateway.isUserConnected).toHaveBeenCalledWith("u1");
  });
});

describe("ProcessEventCreatedHandler", () => {
  const payload = {
    creatorId: "creator",
    eventId: "e1",
    name: "Party",
    creatorName: "Alice",
  };

  it("does nothing when the creator has no followers", async () => {
    const followRepo = followRepoMock();
    const notifRepo = notificationRepoMock();
    const publisher = publisherMock();
    followRepo.findFollowersByUserId.mockResolvedValue([]);

    await new ProcessEventCreatedHandler(
      followRepo,
      notifRepo,
      publisher,
    ).execute(payload);

    expect(notifRepo.save).not.toHaveBeenCalled();
    expect(publisher.publish).not.toHaveBeenCalled();
  });

  it("creates and publishes a notification per follower", async () => {
    const followRepo = followRepoMock();
    const notifRepo = notificationRepoMock();
    const publisher = publisherMock();
    const follows = [
      Follow.create({
        followerId: UserId.fromString("f1"),
        followedId: UserId.fromString("creator"),
      }),
      Follow.create({
        followerId: UserId.fromString("f2"),
        followedId: UserId.fromString("creator"),
      }),
    ];
    followRepo.findFollowersByUserId.mockResolvedValue(follows);

    await new ProcessEventCreatedHandler(
      followRepo,
      notifRepo,
      publisher,
    ).execute(payload);

    expect(notifRepo.save).toHaveBeenCalledTimes(2);
    expect(publisher.publish).toHaveBeenCalledTimes(2);
  });

  it("swallows per-follower errors without failing the whole batch", async () => {
    const followRepo = followRepoMock();
    const notifRepo = notificationRepoMock();
    const publisher = publisherMock();
    notifRepo.save.mockRejectedValue(new Error("db down"));
    followRepo.findFollowersByUserId.mockResolvedValue([
      Follow.create({
        followerId: UserId.fromString("f1"),
        followedId: UserId.fromString("creator"),
      }),
    ]);

    await expect(
      new ProcessEventCreatedHandler(followRepo, notifRepo, publisher).execute(
        payload,
      ),
    ).resolves.toBeUndefined();
    expect(publisher.publish).not.toHaveBeenCalled();
  });
});

describe("ProcessFollowEventHandler", () => {
  it("saves the follow and triggers a follow notification", async () => {
    const followRepo = followRepoMock();
    const createHandler = {
      execute: jest.fn().mockResolvedValue("nid"),
    } as any;
    const payload = {
      followerId: "follower",
      followedId: "followed",
      followerName: "Bob",
      followerAvatar: "a.png",
    };

    await new ProcessFollowEventHandler(followRepo, createHandler).execute(
      payload,
    );

    expect(followRepo.save).toHaveBeenCalledTimes(1);
    expect(createHandler.execute).toHaveBeenCalledTimes(1);
    const command = createHandler.execute.mock.calls[0][0];
    expect(command.type).toBe("follow");
    expect(command.recipientUserId).toBe("followed");
  });
});

describe("ProcessUnfollowEventHandler", () => {
  it("deletes the follow relation", async () => {
    const followRepo = followRepoMock();
    await new ProcessUnfollowEventHandler(followRepo).execute({
      followerId: "follower",
      followedId: "followed",
    });
    expect(followRepo.delete).toHaveBeenCalledTimes(1);
    const [followerId, followedId] = followRepo.delete.mock.calls[0];
    expect(followerId.toString()).toBe("follower");
    expect(followedId.toString()).toBe("followed");
  });
});

describe("ProcessMessageEventHandler", () => {
  it("publishes a MessageReceivedEvent built from the payload", async () => {
    const publisher = publisherMock();
    const payload = {
      receiverId: "r",
      conversationId: "c",
      senderId: "s",
      senderName: "Sam",
      message: "hello",
      messageId: "m1",
      senderAvatar: "av.png",
      createdAt: "2024-01-01",
    };

    await new ProcessMessageEventHandler(publisher).execute(payload);

    expect(publisher.publish).toHaveBeenCalledTimes(1);
    const event = publisher.publish.mock.calls[0][0];
    expect(event).toBeInstanceOf(MessageReceivedEvent);
    expect(event.receiverId).toBe("r");
    expect(event.message).toBe("hello");
  });
});
