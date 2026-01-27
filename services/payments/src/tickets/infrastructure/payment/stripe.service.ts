import { Injectable, Logger } from '@nestjs/common';
import Stripe from 'stripe';
import { Money } from '../../../tickets/domain/value-objects/money.vo';
import { PaymentException } from '../../../tickets/domain/exceptions/payment.exception';
import codes from 'currency-codes';
import { PaymentService } from 'src/tickets/domain/services/payment.service.interface';
import {
  CheckoutSession,
  CreateCheckoutSessionParams,
  WebhookEvent,
} from 'src/tickets/domain/types/payment-service.types';
import type { SupportedLocale } from 'src/tickets/application/services/ticket.translations';

@Injectable()
export class StripeService implements PaymentService {
  private readonly stripe: Stripe;
  private readonly webhookSecret: string;
  private readonly logger = new Logger(StripeService.name);

  private readonly checkoutMessages: Record<SupportedLocale, string> = {
    it: 'Acquisto biglietti per:',
    en: 'Purchasing tickets for:',
    es: 'Compra de entradas para:',
    fr: 'Achat de billets pour:',
    de: 'Ticketkauf für:',
  };

  constructor() {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!apiKey) {
      throw new Error('STRIPE_SECRET_KEY environment variable is not set');
    }
    if (!webhookSecret) {
      throw new Error('STRIPE_WEBHOOK_SECRET environment variable is not set');
    }

    this.stripe = new Stripe(apiKey, {
      apiVersion: '2025-12-15.clover',
    });
    this.webhookSecret = webhookSecret;
  }

  async createCheckoutSessionWithItems(
    params: CreateCheckoutSessionParams,
  ): Promise<CheckoutSession> {
    try {
      const lineItems = params.lineItems.map((item) => ({
        price_data: {
          currency: item.price.getCurrency().toLowerCase(),
          product_data: {
            name: item.productName,
            description: item.productDescription,
          },
          unit_amount: this.toMinorUnits(item.price),
        },
        quantity: item.quantity,
      }));
      const checkoutMessage = this.checkoutMessages[params.language];

      const session = await this.stripe.checkout.sessions.create({
        mode: 'payment',
        line_items: lineItems,
        custom_text: params.eventTitle
          ? {
              submit: {
                message: `${checkoutMessage} ${params.eventTitle}`,
              },
            }
          : undefined,
        metadata: {
          userId: params.userId,
          ticketIds: JSON.stringify(params.ticketIds),
          ticketTypeIds: JSON.stringify(params.ticketTypeIds),
          eventId: params.eventId,
          orderId: params.orderId,
          eventTitle: params.eventTitle || '',
        },
        success_url: params.successUrl,
        cancel_url: params.cancelUrl,
        // Metodi di pagamento accettati
        // payment_method_types: ['card'],
        // // Allow users to enter promo codes
        // allow_promotion_codes: true,
        // // Collect billing address for fraud prevention
        // billing_address_collection: 'required',
        // // Raccolta numero di telefono
        // // phone_number_collection: { enabled: true },
        // // Lingua dell'interfaccia (it, en, fr, de, es, etc.)
        // locale: 'auto',
        // Email pre-compilata se disponibile
        // customer_email: params.customerEmail,
        // Expire session after 30 minutes
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      });
      this.logger.log(
        `Created Stripe checkout session with ${lineItems.length} items: ${session.id}`,
      );

      //TODO: get orderId from metadata or another way
      return {
        id: session.id,
        status: session.status!,
        orderId: session.metadata?.orderId || '',
        expiresAt: session.expires_at,
        redirectUrl: session.url,
      };
    } catch (error) {
      this.logger.error('Failed to create checkout session with items', error);
      throw error;
    }
  }

  async getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    try {
      const session = await this.stripe.checkout.sessions.retrieve(sessionId);
      return {
        id: session.id,
        status: session.status!,
        orderId: session.metadata?.orderId || '',
        expiresAt: session.expires_at,
        redirectUrl: session.url,
      };
    } catch (error) {
      this.logger.error('Failed to retrieve checkout session', error);
      throw error;
    }
  }

  async expireCheckoutSession(sessionId: string): Promise<CheckoutSession> {
    try {
      const session = await this.stripe.checkout.sessions.expire(sessionId);
      this.logger.log(`Expired checkout session: ${sessionId}`);
      return {
        id: session.id,
        status: session.status!,
        orderId: session.metadata?.orderId || '',
        expiresAt: session.expires_at,
        redirectUrl: session.url,
      };
    } catch (error) {
      this.logger.error('Failed to expire checkout session', error);
      throw error;
    }
  }

  /**
   * Construct webhook event from raw body and signature
   */
  constructWebhookEvent(
    payload: string | Buffer<ArrayBufferLike>,
    signature: string,
  ): WebhookEvent {
    try {
      const event = this.stripe.webhooks.constructEvent(
        payload,
        signature,
        this.webhookSecret,
      );
      const session = event.data.object as Stripe.Checkout.Session;
      //TODO evaluate to parametrize webhook event data
      return {
        sessionId: session.id,
        type: event.type,
        orderId: session.metadata?.orderId || '',
      };
    } catch (error) {
      this.logger.error('Failed to construct webhook event', error);
      const message = error instanceof Error ? error.message : 'Unknown error';
      throw new PaymentException(
        `Failed to construct webhook event: ${message}`,
      );
    }
  }

  toMinorUnits(amount: Money): number {
    const data = codes.code(amount.getCurrency());
    const factor = Math.pow(10, data?.digits ?? 2);
    return Math.round(amount.getAmount() * factor);
  }
}
