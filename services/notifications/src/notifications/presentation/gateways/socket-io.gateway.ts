import { Server, Socket } from "socket.io";
import { NotificationGateway } from "../consumers/rabbitmq.consumer";

export class SocketIOGateway implements NotificationGateway {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupSocketHandlers();
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      console.log(`Client connected: ${socket.id}`);

      socket.on("register", (userId: string) => {
        void this.registerUser(socket, userId);
      });

      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async registerUser(socket: Socket, userId: string): Promise<void> {
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socket.id);

    await socket.join(`user:${userId}`);
    console.log(`User ${userId} registered with socket ${socket.id}`);
    socket.emit("registered", { userId });
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);

    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          this.userSockets.delete(userId);
        }
        break;
      }
    }
  }

  sendNotificationToUser(userId: string, notification: any): Promise<void> {
    this.io.to(`user:${userId}`).emit("notification", notification);
    console.log(`Notification sent to user ${userId}`);
    return Promise.resolve();
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserConnected(userId: string): boolean {
    return this.userSockets.has(userId);
  }
}
