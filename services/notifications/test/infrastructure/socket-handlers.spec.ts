import { SocketNotificationHandler } from "../../src/notifications/infrastructure/events/handlers/socket-notification.handler";
import { SocketMessageHandler } from "../../src/notifications/infrastructure/events/handlers/socket-message.handler";
import { NotificationCreatedEvent } from "../../src/notifications/domain/events/notification-created.event";
import { MessageReceivedEvent } from "../../src/notifications/application/handlers/process-message-event.handler";

const gatewayMock = () => ({
  isUserConnected: jest.fn(),
  sendNotificationToUser: jest.fn().mockResolvedValue(undefined),
});

beforeAll(() => {
  jest.spyOn(console, "log").mockImplementation(() => undefined);
  jest.spyOn(console, "error").mockImplementation(() => undefined);
});

describe("SocketNotificationHandler", () => {
  const event = new NotificationCreatedEvent(
    "n1",
    "user-1",
    "like",
    { eventId: "e1" },
    new Date("2024-01-01T00:00:00Z"),
  );

  it("sends a formatted payload when the user is online", async () => {
    const gateway = gatewayMock();
    gateway.isUserConnected.mockReturnValue(true);

    await new SocketNotificationHandler(gateway as any).handle(event);

    expect(gateway.sendNotificationToUser).toHaveBeenCalledWith("user-1", {
      id: "n1",
      type: "like",
      metadata: { eventId: "e1" },
      read: false,
      createdAt: event.createdAt,
    });
  });

  it("does not send when the user is offline", async () => {
    const gateway = gatewayMock();
    gateway.isUserConnected.mockReturnValue(false);

    await new SocketNotificationHandler(gateway as any).handle(event);

    expect(gateway.sendNotificationToUser).not.toHaveBeenCalled();
  });

  it("swallows gateway errors", async () => {
    const gateway = gatewayMock();
    gateway.isUserConnected.mockReturnValue(true);
    gateway.sendNotificationToUser.mockRejectedValue(new Error("socket down"));

    await expect(
      new SocketNotificationHandler(gateway as any).handle(event),
    ).resolves.toBeUndefined();
  });
});

describe("SocketMessageHandler", () => {
  const event = new MessageReceivedEvent(
    "receiver",
    "conv-1",
    "sender",
    "Sam",
    "hello",
    "m1",
    "av.png",
    "2024-01-01",
  );

  it("delivers to both receiver and sender when both are online", async () => {
    const gateway = gatewayMock();
    gateway.isUserConnected.mockReturnValue(true);

    await new SocketMessageHandler(gateway as any).handle(event);

    expect(gateway.sendNotificationToUser).toHaveBeenCalledTimes(2);
    expect(gateway.sendNotificationToUser).toHaveBeenCalledWith(
      "receiver",
      expect.objectContaining({ type: "message" }),
    );
    expect(gateway.sendNotificationToUser).toHaveBeenCalledWith(
      "sender",
      expect.objectContaining({ type: "message" }),
    );
  });

  it("delivers only to the receiver when the sender is offline", async () => {
    const gateway = gatewayMock();
    gateway.isUserConnected.mockImplementation(
      (id: string) => id === "receiver",
    );

    await new SocketMessageHandler(gateway as any).handle(event);

    expect(gateway.sendNotificationToUser).toHaveBeenCalledTimes(1);
    expect(gateway.sendNotificationToUser).toHaveBeenCalledWith(
      "receiver",
      expect.anything(),
    );
  });

  it("does not send when nobody is online", async () => {
    const gateway = gatewayMock();
    gateway.isUserConnected.mockReturnValue(false);

    await new SocketMessageHandler(gateway as any).handle(event);

    expect(gateway.sendNotificationToUser).not.toHaveBeenCalled();
  });
});
