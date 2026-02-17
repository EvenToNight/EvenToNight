export interface MessagePublisher {
  publish(event: any, routingKey: string): void;
}

export const MESSAGE_PUBLISHER = Symbol('MessagePublisher');
