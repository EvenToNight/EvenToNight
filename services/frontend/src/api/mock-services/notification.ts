import type { NotificationAPI } from '../interfaces/notification'
import { createWebSocket, type WebSocket } from './webSocket'
export const activeWebSockets = new Map<string, WebSocket>()

export const mockNotificationApi: NotificationAPI = {
  createWebSocket(userId: string): WebSocket {
    // Reuse existing WebSocket if available
    let ws = activeWebSockets.get(userId)
    if (!ws) {
      ws = createWebSocket(userId)
      activeWebSockets.set(userId, ws)
    }
    return ws
  },
}
