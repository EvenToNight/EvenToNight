export interface ReservationItem {
  categoryId: string
  quantity: number
}

export interface CreateCheckoutRequest {
  userId: string
  eventId: string
  items: ReservationItem[]
}

export interface CreateCheckoutResponse {
  reservationId: string
  paymentIntentId: string
  clientSecret: string
  totalAmount: number
  expiresAt: Date
}

export interface CreateCheckoutSessionResponse {
  sessionUrl: string
  reservationId: string
}

export interface TicketCategory {
  id: string
  eventId: string
  name: string
  description: string
  price: number
  totalCapacity: number
  sold: number
  reserved: number
  available: number
  isActive: boolean
}

export interface PaymentsAPI {
  createCheckout(request: CreateCheckoutRequest): Promise<CreateCheckoutResponse>
  createCheckoutSession(request: CreateCheckoutRequest): Promise<CreateCheckoutSessionResponse>
  cancelCheckout(reservationId: string): Promise<{ status: string }>
  getEventTickets(eventId: string): Promise<TicketCategory[]>
}
