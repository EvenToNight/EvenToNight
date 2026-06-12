import { ExternalEventMapper } from "../../src/notifications/application/mappers/external-event.mapper";

describe("ExternalEventMapper", () => {
  it("maps a like event to a command", () => {
    const cmd = ExternalEventMapper.mapToCommand("interactions.like.created", {
      creatorId: "creator",
      userId: "liker",
      eventId: "e1",
      eventName: "Party",
      userName: "Bob",
      userAvatar: "a.png",
    });
    expect(cmd).not.toBeNull();
    expect(cmd!.type).toBe("like");
    expect(cmd!.recipientUserId).toBe("creator");
    expect(cmd!.metadata).toMatchObject({ eventId: "e1", userName: "Bob" });
  });

  it("returns null for a like a user gives to their own content", () => {
    const cmd = ExternalEventMapper.mapToCommand("interactions.like.created", {
      creatorId: "same",
      userId: "same",
    });
    expect(cmd).toBeNull();
  });

  it("maps a review event to a command", () => {
    const cmd = ExternalEventMapper.mapToCommand(
      "interactions.review.created",
      {
        creatorId: "creator",
        userId: "reviewer",
        eventId: "e2",
        userName: "Ann",
        userAvatar: "b.png",
      },
    );
    expect(cmd!.type).toBe("review");
    expect(cmd!.recipientUserId).toBe("creator");
  });

  it("returns null for an unknown routing key", () => {
    expect(ExternalEventMapper.mapToCommand("unknown.key", {})).toBeNull();
  });
});
