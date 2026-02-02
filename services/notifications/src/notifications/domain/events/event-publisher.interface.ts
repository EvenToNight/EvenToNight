export interface EventPublisher {
  publish(event: any): Promise<void>;
  subscribe(eventName: string, handler: (event: any) => Promise<void>): void;
}
