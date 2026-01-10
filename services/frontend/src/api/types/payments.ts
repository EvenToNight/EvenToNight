export type PaymentID = string

export interface PaymentIntent {
  id: PaymentID
  amount: number
  currency: string
  status: 'pending' | 'succeeded' | 'failed' | 'canceled'
  clientSecret?: string
}

export interface TicketPurchase {
  eventId: string
  quantity: number
  totalAmount: number
}
