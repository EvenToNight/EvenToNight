import { EventPublisher } from "../../domain/events/event-publisher.interface";

export class InMemoryEventPublisher implements EventPublisher {
  private handlers = new Map<string, Array<(event: any) => Promise<void>>>();

  subscribe(eventName: string, handler: (event: any) => Promise<void>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }

    this.handlers.get(eventName)!.push(handler);
    console.log(`✅ Handler subscribed to ${eventName}`);
  }

  async publish(event: any): Promise<void> {
    const eventName = event.constructor.name;
    const handlers = this.handlers.get(eventName) || [];

    console.log(`📢 Publishing ${eventName} to ${handlers.length} handlers`);

    const promises = handlers.map((handler) =>
      handler(event).catch((err) => {
        console.error(`Handler failed for ${eventName}:`, err);
      }),
    );

    await Promise.allSettled(promises);
  }
}
