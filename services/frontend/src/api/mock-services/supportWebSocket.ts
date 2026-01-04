import type {
  SupportWebSocketEvent,
  NewMessageEvent,
  MessageReadEvent,
  TypingEvent,
} from '../types/support'

type EventCallback = (event: SupportWebSocketEvent) => void

export class SupportWebSocket {
  private channel: BroadcastChannel | null = null
  private listeners: Set<EventCallback> = new Set()
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
    const channelName = 'support-chat-global'
    console.log('[WebSocket] Connecting to channel:', channelName, 'for user:', this.userId)
    this.channel = new BroadcastChannel(channelName)

    this.channel.onmessage = (event) => {
      console.log('[WebSocket] Received message:', event.data)
      const wsEvent = event.data as SupportWebSocketEvent
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

  on(callback: EventCallback): () => void {
    this.listeners.add(callback)
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback)
    }
  }

  // Emit event to all other tabs
  emit(event: SupportWebSocketEvent): void {
    if (!this.channel) {
      console.warn('[WebSocket] Cannot emit - WebSocket not connected')
      return
    }
    console.log('[WebSocket] Emitting event:', event)
    this.channel.postMessage(event)
  }

  private notifyListeners(event: SupportWebSocketEvent): void {
    this.listeners.forEach((callback) => {
      try {
        callback(event)
      } catch (error) {
        console.error('Error in WebSocket event listener:', error)
      }
    })
  }

  getConnectionStatus(): boolean {
    return this.isConnected
  }
}

// Factory function to create WebSocket instances
export function createSupportWebSocket(userId: string): SupportWebSocket {
  return new SupportWebSocket(userId)
}

// Type guards for event types
export function isNewMessageEvent(event: SupportWebSocketEvent): event is NewMessageEvent {
  return event.type === 'new_message'
}

export function isMessageReadEvent(event: SupportWebSocketEvent): event is MessageReadEvent {
  return event.type === 'message_read'
}

export function isTypingEvent(event: SupportWebSocketEvent): event is TypingEvent {
  return event.type === 'typing'
}
