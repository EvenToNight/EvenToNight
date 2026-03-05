# 0 - Introduction
The project consists of the design and development of a distributed digital platform called EvenToNight, aimed at connecting organizations that promote social events with users interested in discovering and participating in them. The platform, accessible at [eventonight](https://eventonight.site/), can be used as guest or with an account for additional functionalities.

From a technical perspective, EvenToNight has been designed as a distributed system based on a microservices architecture, enabling modularity, scalability, and independent management of application components. *// TODO: (accenno al DDD ???)*

This choice enable better horizontal and independent scaling of various system components allowing managements of many users concurrently.
The distributed architecture ensures also reliable data persistence, availability and openness, allowing the platform to be easily extended and adapted to evolving requirements. This project thus illustrates the application of distributed systems principles in a real-world web-based platform.

# 1 - Goals of the project
The main goals of the project are:

1. **Create a digital platform for social events**: provide a platform for exploring, discovering, and interacting with social events and other users.

2. **Support both public access and extended functionalities for registered users.**
Allow public browsing of events while offering additional functionalities for registered users and users registered as organization.
3. **Promote interaction between users and organizations.**
Enable users and organizations to communicate and collaborate on the platform.
4. **Increase visibility and credibility of organizations.**
Enhance organizations’ reputation through active community engagement.
5. **Ensure system availability and scalability.**
Design the platform to handle distributed operations efficiently while maintaining responsiveness.
6. **Guarantee transparency and coherence in the distributed architecture.**
Ensure users perceive the platform as a reliable and consistent system, even if it is implemented as a distributed architecture.
7. **Enable future extensibility and adaptability.**
Design the system to easily incorporate new features, services, or integrations without major changes.

## **1.1 Usage scenarios**
This section illustrates typical interactions between the target users of the platform and the system itself. EvenToNight has been conceived for three types of users: unregistered users, registered users, and users registered as organization. The scenarios describe how each type of user interacts with the system according to their needs, providing a practical view of the platform’s behavior.

<p align="center">
    <img src="/case_diagram.jpeg" alt="design" width="100%" />
    <br />
</p>

**Usage scenario: Browsing and filtering events as an unregistered user**

- **Actor**: Unregistered user.
- **Objective**: Explore events according to personal preferences and gather information without registering an account.
- **Main flow**:
    1. The user browses the list of upcoming events.
    2. The user views event details, including photo, description, time, and location.
    3. The user filters events based on personal preferences.
    4. The user explores users registered on the platform.
- **Outcome**:
    1. The user accesses all event information without providing personal data.
    2. The user identifies events aligned with their interests.

**Usage scenario: Discovering and participating in events as a registered user**
// TODO: lasciare recensione

- **Actor**: Registered user.
- **Objective**: Discover upcoming events nearby, evaluate them, and purchase tickets.
- **Main flow**:
    1. The user logs in to the EvenToNight platform.
    2. The user browses the list of upcoming events.
    3. The user applies filters to find events nearby.
    4. The user checks the organization’s page to see past events and read reviews, assessing reliability and type of experiences offered.
    5. The user selects an event and purchases tickets through the platform.
- **Outcome**:
    1. The user quickly finds events near their location.
    2. The purchased ticket appears on the personal page of the user and can be downloaded.

**Usage scenario: Browsing the application with personal preferences and saving events as a registered user**

// TODO: scrivere all'organizzazione

- **Actor**: Registered user.
- **Objective**: Explore and save events through a platform interface set in the preferred language.
- **Main flow**:
    1. The user logs in to the EvenToNight platform.
    2. The user navigates the application, which is displayed in preferred language and look selected in settings.
    3. The user selects events from the catalog and saves them to their personal list.
- **Outcome**:
    1. The user browses events in their chosen language. 
    2. Selected events are stored in the user’s personal list for future reference.

**Usage scenario: Publication of events and monitoring engagement as an organization**

- **Actor**: User registered as organization.
- **Objective**: Publish events and monitor user engagement. 
- **Main flow**:
    1. The user logs in to the EvenToNight platform.
    2. The user creates an event as a draft.
    3. The user adds a collaborating organization to the event.
    4. The user publishes the event.
- **Outcome**:
    1. The event is successfully published and visible to platform users.  
    2. The user receives notifications about new followers and event likes, allowing engagement monitoring.


## **1.2 Definition of done**
The project is considered done when the following criteria are met:

**1. Requirements fulfilled.**

- All main functionalities of the platform, as defined in the functional requirements section, are implemented.
- All business and non-functional requirements specified for the project are satisfied.

**2. Testing completed.** 

- Unit and integration tests for all services pass successfully.
- All API endpoints have been verified using Swagger/OpenAPI.

**3. Deploy ready.**

- All services are containerized and managed via Docker Compose.
- The simulated distributed environment demonstrates service isolation and internal networking.
- All services can be deployed and executed without errors, ensuring a stable runtime environment.

**4. Documentation updated.** 

- API documentation, architectural diagrams, and project documentation are complete, consistent, and up to date with the implemented system.