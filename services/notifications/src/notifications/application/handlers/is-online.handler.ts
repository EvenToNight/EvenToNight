import { NotificationGateway } from "../../presentation/gateways/socket-io.gateway";

export class IsOnlineHandler {
  constructor(private readonly notificationGateway: NotificationGateway) {}

  execute(userId: string): boolean {
    return this.notificationGateway.isUserConnected(userId);
  }
}
