# 3 - Requirements Analysis

## **3.1 Requirements list**
The main requirements that the application must meet are listed below.

### **3.1.1 Business requirements**

- The platform allows organizations to create and publish posts related to the events they promote.
- Users can use the platform to discover events nearby, based on location and their interests.
- The system enables online ticket sales for events, providing organizations with a tool to monetize their activities.

### **3.1.2 Functional requirements**
**Types of users supported by the system:**
- Unregistered users, who can explore the platform.
- Registered users, who can fully utilize the platform’s features.
- Users registered as organization, who can create and publish events, manage ticketing, and fully utilize the platform’s features.
**Functional requirements for all users:**
- View the Home screen, including interaction modes such as searching for events, viewing popular events, upcoming events, and latest additions.
- View all events published on the platform and all registered users from the Explore screen, applying search filters.
**Functional requirements for registered users:**
- Receive a personalized event feed based on specified interests.
- Like and unlike events.
- Follow and unfollow other registered users.
- Purchase tickets for events.
- Leave a review after attending an event.
- Contact organizations directly within the platform to request support.
- Receive notifications about:
    - new followers
    - new events published by followed organizations
    - new messages

**Functional requirements for users registered as organization:**
- Create events, choosing whether to make them public or save them as drafts.
- Specify collaborators when creating events.
- Receive notifications about likes and reviews on their own events.

### **3.1.3 Non-functional requirements**
- **Availability**: every request sent to a non-failing node in the system must receive a response.
- **Reliability**: the system must operate correctly over time, minimizing the occurrence of faults.
- **Fault Tolerance**: the system must tolerate failures of individual services (i.e. containerized microservices) without affecting the overall platform operation.
- **Security**: the system requires user authentication and enforces authorization to access resources according to defined rules. In addition, to ensure password confidentiality, only a secure hash of each user’s password will be stored.
- **Robustness**: the system must handle incorrect inputs, providing consistent error messages without compromising system stability.
- **Extensibility**: the system must support easy customization and the addition of new functionalities.
- **Maintainability**: the system must be easy to maintain, allowing developers to efficiently fix bugs, add new features, and update the system. This is supported by well-structured and well-documented code.
- **Accessibility**: the system’s graphical interface must be accessible, supporting standard accessibility guidelines.
- **Portability**: the system must be responsive and adapt to different screen sizes and devices, including PCs, tablets, and smartphones.
- **Deployability**: the system must automatically update to the latest release version.
- **Architectural Constraint**: the system must be developed following a microservices architecture, ensuring modularity, independent service deployment, and scalability.

## **3.2 Top-down analysis

### 3.2.1 Architectural styles**
Starting from the identified requirements, an **event-based architecture** was selected to design the distributed platform. Backend microservices interact asynchronously through message-passing mechanisms implemented via RabbitMQ.

This architectural style was chosen because it addresses several non-functional requirements of the system. In particular, the following architectural properties, provided by the event-based design, directly contribute to satisfying the system’s non-functional requirements:

- **Referential and spatial decoupling**: producers and consumers do not reference or depend on each other’s location. It supports extensibility, allowing new services to be added without modifying existing components.
- **Temporal decoupling**: durable queues and persistent messages ensure that events are stored until consumers are able to process them. This ensures that producer services remain responsive even if consumer services are temporarily unavailable, supporting fault tolerance and availability.
- **Loosely coupled services**: producers publish messages without waiting for consumers to respond, and consumers process messages independently. It supports fault tolerance, maintainability and extensibility, as temporary service failures or modifications do not affect other components.
- **Message queues as buffers**: queues smooth load peaks by decoupling producer and consumer execution timing. It supports extensibility by enabling the addition of multiple consumer instances in future deployments, allowing potential horizontal scalability.
- **Decoupled service design**: microservices are modular and independently deployable. It supports maintainability and extensibility, simplifying debugging, updates, and the addition of new functionalities.

At the system boundary level, the platform also follows a **layered architecture**:

- **Presentation layer**: the containerized frontend microservice, providing the user interface.
- **Application layer**: containerized backend microservices exposing REST APIs.
- **Data layer**: repositories interacting with databases for persistence.

The layered organization provides a high-level view of control flow in the distributed platform, highlighting the separation of concerns between user interface, business logic, and data management.

**3.2.2 Interaction patterns**
To implement communication between microservices, two interaction patterns were adopted:

- **Synchronous REST communication between frontend and backend services**: the frontend interacts with backend services via REST APIs. This synchronous pattern ensures that a response is returned only after the backend has successfully processed the request and is suitable for handling user interactions (e.g., login, search, ticket purchase).
- **Asynchronous event-driven communication between backend services**: backend microservices communicate via RabbitMQ events, using the publish-subscribe pattern with exchange and queues. This pattern decouples services and supports extensibility, maintainability, and potential horizontal scalability.

This combination of synchronous and asynchronous interaction patterns ensures that user-driven requests are handled reliably, while preserving the benefits of distributed event-based coordination.