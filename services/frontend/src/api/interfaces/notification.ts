import type { WebSocket } from '@/api/mock-services/webSocket'

export interface NotificationAPI {
  createWebSocket(userId: string): WebSocket
}
