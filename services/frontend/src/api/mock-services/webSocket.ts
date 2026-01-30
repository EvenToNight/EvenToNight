import type {
  NewMessageReceivedEvent,
  NotificationData,
  NotificationEvent,
  NotificationType,
} from '../types/notifications'

type EventCallback = (event: NotificationEvent) => void

export class WebSocket {
  private channel: BroadcastChannel | null = null
  private listeners = new Map<NotificationType, Set<EventCallback>>()
  private isConnected = false

  constructor(private userId: string) {}

  connect(): void {
    if (this.isConnected) {
      console.log('[WebSocket] Already connected')
      return
    }

    // Check if BroadcastChannel is supported
    if (typeof BroadcastChannel === 'undefined') {
      console.error('[WebSocket] BroadcastChannel is not supported in this browser')
      return
    }

    // Create a BroadcastChannel for cross-tab communication
    // Use a global channel so all tabs can communicate regardless of user
    const channelName = 'eventonight-global'
    console.log('[WebSocket] Connecting to channel:', channelName, 'for user:', this.userId)
    this.channel = new BroadcastChannel(channelName)

    this.channel.onmessage = (event: MessageEvent) => {
      console.log('[WebSocket] Received message:', event.data)
      const wsEvent = event.data as NotificationData
      this.notifyListeners(wsEvent)
    }

    this.isConnected = true
    console.log('[WebSocket] Connected successfully')
  }

  disconnect(): void {
    if (this.channel) {
      this.channel.close()
      this.channel = null
    }
    this.isConnected = false
    this.listeners.clear()
  }

  on(eventType: NotificationType, callback: EventCallback): () => void {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, new Set())
    }
    this.listeners.get(eventType)!.add(callback)

    // Return unsubscribe function
    return () => {
      this.listeners.get(eventType)?.delete(callback)
    }
  }

  emit(eventType: NotificationType, data: NotificationEvent): void {
    if (!this.channel) {
      console.warn('[WebSocket] Cannot emit - WebSocket not connected')
      return
    }
    const notificationData: NotificationData = { type: eventType, data }
    console.log('[WebSocket] Emitting event:', notificationData)
    this.channel.postMessage(notificationData)
  }

  private notifyListeners(event: NotificationData): void {
    const listeners = this.listeners.get(event.type)
    listeners?.forEach((callback) => {
      try {
        callback(event.data)
      } catch (error) {
        console.error('Error in WebSocket event listener:', error)
      }
    })
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

export function createWebSocket(userId: string): WebSocket {
  return new WebSocket(userId)
}

//TODO: evaluate usage of type guards for event types
export function isNewMessageEvent(
  event: NotificationData
): event is NotificationData & { data: NewMessageReceivedEvent } {
  return event.type === 'new_message_received'
}
