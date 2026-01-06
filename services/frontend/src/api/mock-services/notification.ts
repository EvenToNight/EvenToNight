import type { NotificationAPI } from '../interfaces/notification'
import { createWebSocket, type WebSocket } from './webSocket'
export const activeWebSockets = new Map<string, WebSocket>()

export const mockNotificationApi: NotificationAPI = {
  createWebSocket(userId: string): WebSocket {
    console.log('[MockAPI] createWebSocket called for userId:', userId)
    // Reuse existing WebSocket if available
    let ws = activeWebSockets.get(userId)
    if (!ws) {
      console.log('[MockAPI] Creating new WebSocket for userId:', userId)
      ws = createWebSocket(userId)
      activeWebSockets.set(userId, ws)
    } else {
      console.log('[MockAPI] Reusing existing WebSocket for userId:', userId)
    }
    console.log('[MockAPI] Total active WebSockets:', activeWebSockets.size)
    return ws
  },
}
