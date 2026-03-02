## 4 Implementation

Full API documentation has been produced for all services:

- [**OpenAPI specs** (REST)](/EvenToNight/openAPI/).
- [**AsyncAPI specs** (RabbitMQ)](/EvenToNight/asyncAPI/).

The sections below cover implementation choices not captured by the API specs.

### 4.1 Technological details

**In-transit data representation**

All REST APIs and RabbitMQ messages use **JSON** as the serialization format.

**Database querying**

All application services use **MongoDB** as their document store:

- `users` and `events` (Scala) query MongoDB via the raw Java driver (`mongodb-driver-sync`), using the Filters API and manually registered BSON codecs — no ODM.
- `chat`, `interactions`, `notifications`, and `ticketing` (Node.js) use **Mongoose** as the ODM, with schema decorators and typed model queries.

The `media` service has no database; it stores binary files in **MinIO**, an S3-compatible self-hosted object store. MinIO was chosen over AWS S3 to avoid vendor lock-in — the API is identical, so the AWS S3 SDK is used without modification. PostgreSQL is only used internally by Keycloak.

**Authentication**

Authentication is handled by **Keycloak**. On login, Keycloak issues a short-lived JWT access token and a longer-lived refresh token. Every protected API endpoint requires a `Authorization: Bearer <token>` header. Each service validates the JWT independently using Keycloak's RSA public key — the `users` service exposes a `/public-keys` endpoint that the other services fetch at startup. No centralised auth gateway is involved in validating requests.

The frontend stores tokens in `sessionStorage`, automatically refreshes the access token before expiry, and injects it into all outgoing requests.

**Authorization**

The system uses **Role-Based Access Control (RBAC)** with two roles: `member` and `organization`. Roles are assigned in Keycloak at registration time and embedded in the JWT. Services extract the role from the token and apply authorization logic at the handler level — for example, only an `organization` can create events, and only the owning user can modify their own resources.

**RabbitMQ message format**

All domain events published to the `eventonight` topic exchange share a common envelope:

```json
{
  "eventType": "event.published",
  "occurredAt": "2025-01-01T12:00:00Z",
  "payload": { ... }
}
```

The `eventType` field doubles as the AMQP routing key.

**MongoDB single-node replica set**

MongoDB transactions require a replica set. All services run MongoDB in replica set mode even on a single node — using `--replSet rs0` and initialising a one-member replica set at startup. This is a non-obvious setup choice that unlocks multi-document transaction support without requiring a multi-node cluster.

**Stripe webhook authentication**

Stripe signs every webhook payload with an HMAC-SHA256 signature using a shared secret. The `ticketing` service verifies this signature before processing any incoming webhook, ensuring that only legitimate Stripe events are accepted.

**Socket.IO: authenticated connections and scaling**

WebSocket connections to the `notifications` service are authenticated: the client sends its JWT and `userId` during the Socket.IO handshake, and the server validates the token before allowing the connection. Socket.IO was chosen over raw WebSocket also because it natively supports a Redis pub/sub adapter, which would allow the `notifications` service to scale horizontally across multiple replicas while still delivering pushes to the correct client regardless of which replica it is connected to.

**Key implementation patterns**

- **Transactional outbox**: each service writes domain events to an outbox collection atomically with the state change (within a MongoDB transaction); a relay process forwards them to RabbitMQ, retrying with exponential backoff until delivery succeeds. This decouples message publishing from the availability of RabbitMQ.

- **Inbox Pattern / Idempotency Key**

- **Saga pattern (checkout)**: the ticket purchase flow is implemented as a two-phase saga. Phase 1 reserves inventory and creates an order atomically in MongoDB (TX1). Phase 2 calls Stripe to create a checkout session. If Stripe fails, a compensating transaction releases the reserved tickets and cancels the order. If the service crashes between the two phases, the compensation does not run — tickets remain in `PENDING` state indefinitely. The correct mitigation would be a scheduled cleanup job that releases orders stuck in `PENDING` beyond a timeout threshold; this is a known limitation of the current implementation.

```mermaid
sequenceDiagram
    participant Client
    participant Ticketing
    participant MongoDB
    participant Stripe

    Client->>Ticketing: POST /checkout-sessions

    note over Ticketing,MongoDB: TX1 — MongoDB transaction
    Ticketing->>MongoDB: lock ticket types, reserve tickets
    Ticketing->>MongoDB: create order (PENDING)
    MongoDB-->>Ticketing: committed

    Ticketing->>Stripe: create checkout session

    alt Stripe succeeds
        Stripe-->>Ticketing: session id + redirect URL
        Ticketing-->>Client: 201 session URL
    else Stripe fails
        Stripe-->>Ticketing: error
        note over Ticketing,MongoDB: Compensating TX
        Ticketing->>MongoDB: release tickets, cancel order
        Ticketing-->>Client: 500 error
    else Service crashes after TX1
        note over Ticketing,MongoDB: ⚠ known limitation — tickets stuck PENDING
    end
```
