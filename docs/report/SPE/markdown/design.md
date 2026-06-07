# 2 - Design

The design of EvenToNight follows a **Domain-Driven Design (DDD)** approach. The whole platform is articulated into autonomous **bounded contexts**, each one shipped as an independent microservice, communicating through asynchronous domain events on a message broker. This chapter documents the design process — from the event-storming sessions that bootstrapped the model, to the strategic decomposition into bounded contexts, the tactical patterns adopted inside each service, and the integration mechanisms that keep the system loosely coupled while remaining consistent.

## 2.1 Strategic Design

### 2.1.1 Domain, subdomains and distillation

EvenToNight's overall business domain is *connecting event-organising entities with people interested in attending and discussing social events*. Following the standard DDD classification, we distilled it into three categories of subdomains:

| Type | Subdomain | Rationale |
|---|---|---|
| **Core** | Event lifecycle, Ticketing & Sales, Social Interactions | The features that differentiate the product and on which most design effort is spent |
| **Supporting** | Notifications, Chat | Necessary to deliver a complete user experience, but standard in their mechanics |
| **Generic** | Identity, Media storage | Solved problems for which we lean on third-party building blocks (Keycloak, S3-compatible storage) |

This classification drove the resource allocation: the *core* subdomains received the deepest tactical DDD treatment (aggregates, value objects, invariants, hand-rolled domain services), while *generic* subdomains were essentially wrappers over the external systems that already solve them.

### 2.1.2 Event Storming

The DDD model presented in this chapter did not emerge from an up-front, document-driven analysis: it was distilled from a sequence of collaborative **Event Storming** sessions (Brandolini's technique), each producing one of the diagrams reproduced below. A consistent colour code is used across the three levels: **orange** for domain events (facts, past tense), **blue** for commands (the intent that triggers an event), **yellow ovals** for aggregates that receive commands and emit events, **purple** for policies (`whenever X happens then Y`), and **light yellow** for *hotspots* — open questions and conflicts to be resolved.

#### Big Picture Event Storming

The first session collected every relevant domain event as a past-tense fact, with no order, command or aggregate attached yet — just the raw vocabulary of the domain, clustered loosely by topic.

<p align="center">
    <img src="/eventstorming/phase1.png" alt="Big Picture Event Storming" width="100%" />
    <br />
</p>

#### Process Modeling Event Storming

A second pass ordered the events along temporal arrows, surfaced open questions as **hotspots** (yellow stickies, addressed in the rest of the chapter) and promoted a small subset of events to **pivotal** by drawing a thicker border: `Member Created`, `Organization Created`, `Event Published`, `Order Confirmed` and `Event Completed`. Around the pivotal events the team made explicit the **policies** the system runs automatically; the convergence of every cross-context policy on `Notification Created` is the strongest evidence that Notifications deserves to be extracted as a context of its own, a decision finalised at the next level.

<p align="center">
    <img src="/eventstorming/phase2.png" alt="Process Modeling Event Storming" width="100%" />
    <br />
</p>

#### Software Design Event Storming

The third pass introduced the only technical element: aggregates. For each command, the team identified the aggregate that validates it and emits the resulting event; clustering aggregates by linguistic cohesion yielded the seven bounded contexts shown in the figure, which became the seven microservices of §2.2.

| Bounded context | Aggregates |
|---|---|
| User | `Member`, `Organization` |
| Media | `Media` |
| Events | `Event` |
| Notification | `Notification` |
| Chat | `Conversation`, `Message` |
| Interaction | `Follow`, `Like`, `Review`, `Participation` |
| Ticketing | `Order`, `Ticket` |

The purple policies crossing the context boundaries become the asynchronous integrations carried over RabbitMQ (§2.4): `Event Published → Send notification` and `Message Sent → Send notification` feed the Notification context from the rest of the platform, while `Order Confirmed → Participate to an event` connects Ticketing to Interaction by materialising a `Participation` for every confirmed buyer.

<p align="center">
    <img src="/eventstorming/phase3.png" alt="Software Design Event Storming" width="100%" />
    <br />
</p>
