# Payments Microservice

Microservizio NestJS per la gestione dei pagamenti con Stripe, tracciamento disponibilità biglietti e vendita biglietti per eventi.

## Funzionalità

### Core Features
- ✅ **Stripe Integration**: Payment Intent flow completo con webhook verification
- ✅ **Inventory Management**: Tracciamento consistente disponibilità biglietti (sold/reserved/available)
- ✅ **Reservation Hold**: Blocco temporaneo biglietti durante checkout (10 minuti default)
- ✅ **Categorie Biglietti**: Supporto per VIP, Standard, Early Bird con prezzi diversi
- ✅ **QR Code Generation**: Generazione automatica QR codes per ogni biglietto
- ✅ **Refund Management**: Rimborsi automatici (evento cancellato) e manuali
- ✅ **RabbitMQ Integration**: Consumer e publisher per comunicazione event-driven
- ✅ **Anti-Overselling**: Atomic MongoDB transactions per prevenire vendita eccessiva

## Architettura

### Moduli
- **InventoryModule**: Gestione categorie biglietti e reservation
- **PaymentsModule**: Integrazione Stripe e gestione ordini
- **TicketsModule**: Generazione biglietti e QR codes
- **JobsModule**: Cron jobs (pulizia reservation scadute)

### Database (MongoDB)
- **TicketCategory**: Categorie biglietti per evento
- **Reservation**: Hold temporanei con TTL
- **Order**: Record acquisti completati
- **Payment**: Transazioni Stripe
- **Ticket**: Biglietti individuali con QR code
- **Refund**: Rimborsi

## API Endpoints

### Checkout
- `POST /checkout/create` - Crea reservation + Payment Intent
- `POST /checkout/cancel` - Cancella reservation

### Tickets
- `GET /tickets/users/:userId` - Lista biglietti utente
- `GET /tickets/:ticketNumber` - Dettaglio biglietto
- `PATCH /tickets/:ticketNumber/use` - Marca come usato (check-in)

### Inventory (Admin)
- `POST /admin/events/:eventId/inventory/setup` - Setup inventory
- `GET /events/:eventId/tickets` - Categorie disponibili
- `GET /events/:eventId/availability` - Check disponibilità
- `GET /admin/events/:eventId/sales` - Analytics vendite

### Refunds (Admin)
- `POST /admin/refunds` - Refund manuale
- `POST /admin/refunds/events/:eventId/cancel` - Cancella evento + refund automatici

### Webhooks
- `POST /webhooks/stripe` - Stripe webhook (payment_intent.succeeded/failed)

## RabbitMQ Events

### Consumer (da Events service)
- `event.tickets.created` - Setup inventory per nuovo evento
- `event.tickets.updated` - Aggiorna categorie
- `event.cancelled` - Trigger refund automatici

### Publisher
- `ticket.purchased` - Biglietti acquistati
- `ticket.refunded` - Biglietti rimborsati
- `ticket.used` - Check-in evento

## Setup

### Variabili Ambiente
```bash
PAYMENTS_SERVICE_PORT=9040
MONGO_HOST=mongo-payments
RABBITMQ_HOST=rabbitmq
RABBITMQ_USER=admin
RABBITMQ_PASS=<secret>
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
RESERVATION_TTL_MINUTES=10
```

### Installazione
```bash
cd services/payments
npm install
npm run build
```

### Development
```bash
npm run start:dev
```

### Docker
```bash
docker-compose -f docker-compose.yaml -f docker-compose-dev.yaml up
```

## Flusso Checkout

1. **Frontend**: POST /checkout/create
   - Backend crea reservation (atomic lock biglietti)
   - Backend crea Stripe Payment Intent
   - Restituisce `clientSecret` per Stripe Elements

2. **Frontend**: Stripe Elements per raccogliere payment method e confermare pagamento

3. **Stripe**: Webhook `payment_intent.succeeded`
   - Backend conferma reservation (reserved → sold)
   - Crea Order e Payment records
   - Genera Ticket con QR codes
   - Pubblica evento `ticket.purchased`

4. **Alternativa**: Reservation scade dopo 10 min
   - Cron job rilascia biglietti riservati

## Sicurezza

- ✅ Stripe webhook signature verification (MANDATORY)
- ✅ MongoDB transactions per atomicità
- ✅ Input validation con class-validator
- ✅ Raw body support per webhook verification

## Testing

```bash
# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Coverage
npm run test:cov
```

## Monitoring

### Metriche da tracciare
- Checkout API latency (p50, p95, p99)
- Stripe webhook processing time
- Reservation-to-purchase conversion rate
- Refund rate per event
- Database transaction rollback rate

### Alerting
- Overselling detection (sold > totalCapacity)
- Stripe webhook failures
- High refund rate

## Dipendenze Principali

- `@nestjs/core`, `@nestjs/microservices`, `@nestjs/mongoose`: Framework
- `stripe`: Integrazione pagamenti
- `mongoose`: MongoDB ODM
- `qrcode`: Generazione QR codes
- `amqplib`: RabbitMQ client
- `@nestjs/schedule`: Cron jobs

## Port

- **Service**: 9040
- **Mongo Express**: 9041
