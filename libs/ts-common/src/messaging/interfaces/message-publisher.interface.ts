export interface MessagePublisher {
  publish(event: any, routingKey: string, messageId?: string): Promise<void>;
}

export const MESSAGE_PUBLISHER = Symbol('MessagePublisher');
