import { Server, Socket } from "socket.io";
import { JwtService } from "../../../config/jwt.config";
import { config } from "../../../config/env.config";

export interface NotificationGateway {
  sendNotificationToUser(userId: string, notification: any): Promise<void>;
  isUserConnected(userId: string): boolean;
  broadcastUserOnline(userId: string, userInfo?: any): void;
  broadcastUserOffline(userId: string): void;
}

export class SocketIOGateway implements NotificationGateway {
  private io: Server;
  private userSockets: Map<string, Set<string>> = new Map();

  constructor(io: Server) {
    this.io = io;
    this.setupAuthMiddleware();
    this.setupSocketHandlers();
  }

  private setupAuthMiddleware(): void {
    this.io.use((socket: Socket, next) => {
      void this.authenticateSocket(socket, next);
    });
  }

  private async authenticateSocket(
    socket: Socket,
    next: (err?: Error) => void,
  ): Promise<void> {
    if (!config.jwtAuthPublicKeyUrl) {
      console.log("⚠️  Socket.io authentication skipped");
      next();
      return;
    }

    const token =
      (socket.handshake.auth as { token?: string }).token ||
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      console.log("❌ No token provided");
      next(new Error("Authentication error: No token provided"));
      return;
    }

    try {
      const payload = await JwtService.verifyToken(token);

      if (!payload || !payload.user_id) {
        next(new Error("Authentication error: Invalid token"));
        return;
      }

      // TODO: maybe verify token user_is matches with socket.data userId
      const data = socket.data as { userId?: string };
      data.userId = payload.user_id;
      next();
    } catch (err) {
      console.error("JWT verification error:", err);
      next(new Error("Authentication error: Invalid token"));
    }
  }

  private setupSocketHandlers(): void {
    this.io.on("connection", (socket: Socket) => {
      const data = socket.data as { userId?: string };
      const userId = data.userId;

      console.log(
        `Client connected: ${socket.id}${userId ? ` (user: ${userId})` : ""}`,
      );

      if (userId) {
        void this.registerUser(socket, userId);
      }

      socket.on("disconnect", () => {
        this.handleDisconnect(socket);
      });
    });
  }

  private async registerUser(socket: Socket, userId: string): Promise<void> {
    const wasOffline = !this.userSockets.has(userId);
    if (!this.userSockets.has(userId)) {
      this.userSockets.set(userId, new Set());
    }
    this.userSockets.get(userId)?.add(socket.id);

    await socket.join(`user:${userId}`);
    console.log(`User ${userId} registered with socket ${socket.id}`);
    socket.emit("registered", { userId });
    if (wasOffline) {
      this.broadcastUserOnline(userId);
    }
  }

  private handleDisconnect(socket: Socket): void {
    console.log(`Client disconnected: ${socket.id}`);

    let disconnectedUserId: string | null = null;

    for (const [userId, socketIds] of this.userSockets.entries()) {
      if (socketIds.has(socket.id)) {
        socketIds.delete(socket.id);
        if (socketIds.size === 0) {
          this.userSockets.delete(userId);
          disconnectedUserId = userId;
        }
        break;
      }
    }
    if (disconnectedUserId) {
      this.broadcastUserOffline(disconnectedUserId);
    }
  }

  sendNotificationToUser(userId: string, notification: any): Promise<void> {
    const topic = this.getTopicFromNotificationType(notification.type);
    this.io.to(`user:${userId}`).emit(topic, notification);
    console.log(`Notification sent to user ${userId}`);
    return Promise.resolve();
  }

  private getTopicFromNotificationType(type: string): string {
    const topicMap: Record<string, string> = {
      message: "message",
      like: "like",
      follow: "follow",
      review: "review",
      new_event: "new_event",
    };

    return topicMap[type] || "notification";
  }

  getConnectedUsers(): string[] {
    return Array.from(this.userSockets.keys());
  }

  isUserConnected(userId: string): boolean {
    const connected = this.userSockets.has(userId);
    console.log(`🔍 Checking if user ${userId} is connected: ${connected}`);
    console.log(`📊 Connected users:`, Array.from(this.userSockets.keys()));
    return connected;
  }

  broadcastUserOnline(userId: string): void {
    console.log(`📢 Broadcasting: User ${userId} is now online`);

    this.io.except(`user:${userId}`).emit("user-online", {
      userId,
      timestamp: new Date(),
    });
  }

  broadcastUserOffline(userId: string): void {
    console.log(`📢 Broadcasting: User ${userId} is now offline`);

    this.io.emit("user-offline", {
      userId,
      timestamp: new Date(),
    });
  }
}
