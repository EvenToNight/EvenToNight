import { InMemoryEventPublisher } from "../../src/notifications/infrastructure/events/in-memory-event-publisher";

class SampleEvent {
  constructor(public readonly value: string) {}
}

describe("InMemoryEventPublisher", () => {
  beforeAll(() => {
    jest.spyOn(console, "log").mockImplementation(() => undefined);
    jest.spyOn(console, "error").mockImplementation(() => undefined);
  });

  it("delivers an event to all handlers subscribed to its constructor name", async () => {
    const publisher = new InMemoryEventPublisher();
    const h1 = jest.fn().mockResolvedValue(undefined);
    const h2 = jest.fn().mockResolvedValue(undefined);
    publisher.subscribe("SampleEvent", h1);
    publisher.subscribe("SampleEvent", h2);

    const event = new SampleEvent("x");
    await publisher.publish(event);

    expect(h1).toHaveBeenCalledWith(event);
    expect(h2).toHaveBeenCalledWith(event);
  });

  it("is a no-op when there are no handlers for the event", async () => {
    const publisher = new InMemoryEventPublisher();
    await expect(
      publisher.publish(new SampleEvent("y")),
    ).resolves.toBeUndefined();
  });

  it("isolates a failing handler from the others", async () => {
    const publisher = new InMemoryEventPublisher();
    const failing = jest.fn().mockRejectedValue(new Error("boom"));
    const ok = jest.fn().mockResolvedValue(undefined);
    publisher.subscribe("SampleEvent", failing);
    publisher.subscribe("SampleEvent", ok);

    await expect(
      publisher.publish(new SampleEvent("z")),
    ).resolves.toBeUndefined();
    expect(ok).toHaveBeenCalledTimes(1);
  });
});
