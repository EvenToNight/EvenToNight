export interface OutboxRelayServiceInterface {
  start(): void;
  stop(): void;
}

export const OUTBOX_RELAY_SERVICE = Symbol('OutboxRelayService');
