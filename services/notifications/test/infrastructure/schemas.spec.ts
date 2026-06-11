import { NotificationModel } from "../../src/notifications/infrastructure/persistence/mongodb/schemas/notification.schema";
import { FollowModel } from "../../src/notifications/infrastructure/persistence/mongodb/schemas/follow.schema";

describe("mongoose schemas", () => {
  it("registers the Notification model with the expected name and paths", () => {
    expect(NotificationModel.modelName).toBe("Notification");
    expect(NotificationModel.schema.path("userId")).toBeDefined();
    expect(NotificationModel.schema.path("type")).toBeDefined();
    expect(NotificationModel.schema.path("read")).toBeDefined();
  });

  it("registers the Follow model with the expected name and paths", () => {
    expect(FollowModel.modelName).toBe("Follow");
    expect(FollowModel.schema.path("followerId")).toBeDefined();
    expect(FollowModel.schema.path("followedId")).toBeDefined();
  });
});
