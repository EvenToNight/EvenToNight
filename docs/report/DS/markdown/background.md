# 2 - Background

## Distributed systems fundamentals

**CAP theorem** states that a distributed system can guarantee at most two of three properties simultaneously: *Consistency* (all nodes see the same data at the same time), *Availability* (every request receives a response), and *Partition tolerance* (the system continues operating despite network partitions). Since partition tolerance is non-negotiable in a real network, systems must choose between consistency and availability under a partition. Systems that prioritise availability accept that replicas may temporarily diverge — relying instead on *eventual consistency*.

**Eventual consistency** is a consistency model in which, in the absence of new updates, all replicas of a data item will converge to the same value over time. It trades immediate cross-service consistency for higher availability and lower coupling, accepting that different parts of the system may temporarily observe slightly different states.

**FLP impossibility** (Fischer, Lynch, Paterson) proves that in a fully asynchronous distributed system, consensus cannot be guaranteed if even a single process may fail. In practice this means failure detection is impossible without some notion of time: a slow process is indistinguishable from a crashed one. **Timeouts** are the practical solution — a process is declared failed if it does not respond within a bounded time — and motivate **exponential backoff** in reconnection logic, spacing out retries to avoid overwhelming a recovering dependency.

**Availability** is the degree to which a system is operational and responsive when needed. **High availability (HA)** extends this by designing the system to minimise downtime through redundancy and automatic failover: components are replicated across multiple nodes so that the failure of any single node does not interrupt service.

**At-least-once delivery** is a message delivery guarantee where the broker ensures a message is delivered to the consumer at least once, but may deliver it more than once in the event of failures or retries. Consumers must therefore be designed to tolerate duplicate messages.

**Idempotency** is the property of an operation whereby applying it multiple times produces the same result as applying it once. In distributed systems, idempotent message handlers are the standard mitigation for at-least-once delivery semantics.

## Architectural styles

**Microservices** decompose an application into small, independently deployable services, each responsible for a single bounded context. Combined with the **database-per-service** pattern, each service owns its data store exclusively, preventing coupling at the persistence layer and allowing schemas to evolve independently.

**Domain-Driven Design (DDD)** provides the modeling vocabulary: a domain is partitioned into *bounded contexts*, each with its own ubiquitous language. Within a context, *aggregates* enforce business invariants, *value objects* represent immutable concepts, and *domain events* describe state changes that other contexts may react to.

**Clean Architecture** organises a service's codebase into concentric layers — domain, application, infrastructure, presentation — with a strict inward dependency rule: outer layers depend on inner ones, never the reverse. This keeps domain logic framework-agnostic and independently testable.

**CQRS (Command Query Responsibility Segregation)** separates write operations (commands) from read operations (queries) at the application layer, assigning each to a dedicated handler. This makes individual operations smaller and more focused, and opens the door to independent scaling of read and write paths.

## Interaction patterns

**REST over HTTP** is the standard synchronous request/response pattern: the client sends a request and blocks until the server replies. Suitable for operations that require an immediate result.

**AMQP (message broker)** enables asynchronous, decoupled communication. A producer publishes a message to an exchange; the broker routes it to bound queues; consumers process it independently. A *topic exchange* routes messages by routing key pattern, allowing fine-grained subscriptions. *Quorum queues* replicate messages across cluster nodes for durability and availability.

**WebSocket** provides a persistent, full-duplex channel between client and server, enabling server-initiated push without polling.

**Webhooks** allow external systems to push events into the application via HTTP callbacks, triggered by events on the provider's side.

**Transactional outbox** ensures reliable event publishing: the domain event is written to an outbox table in the same database transaction as the state change; a relay process reads from the outbox and forwards messages to the broker, retrying until success. This decouples message publishing from broker availability.

**Saga** coordinates a multi-step operation across services without a distributed transaction. Each step has a compensating action that can undo its effect if a later step fails.

## Software frameworks and technologies

| Technology | Role |
|---|---|
| Docker / Compose / Swarm | Containerisation and orchestration |
| Traefik | API gateway, reverse proxy, load balancer, rate limiter|
| Cloudflare + cloudflared | DNS, TLS termination, encrypted inbound tunnel |
| RabbitMQ | AMQP message broker |
| MongoDB | Document store (per-service) |
| PostgreSQL | Relational store (Keycloak) |
| MinIO | S3-compatible object storage |
| Keycloak | Identity provider, JWT issuance |
| Stripe | Third-party payment provider |
| NestJS | Node.js framework (structured modules, DI) |
| Node.js + Express | Minimal HTTP server runtime |
| Scala 3 + Cask | Functional backend services |
| Vue 3 + Vite | Single-page application frontend |
| Socket.IO | WebSocket abstraction with Redis pub/sub adapter |
