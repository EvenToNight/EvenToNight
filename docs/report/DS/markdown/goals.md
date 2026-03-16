# 0 - Introduction
The project consists of the design and development of a distributed digital platform called **EvenToNight**, aimed at connecting organizations that promote social events with users interested in discovering and participating in them. The platform, accessible at [eventonight](https://eventonight.site/), can be used either as a guest or through a registered account that provides additional functionalities.

From a technical perspective, EvenToNight has been designed as a distributed system based on a microservices architecture, supporting modularity, scalability, and the independent management of application components.

This architectural choice enables horizontal and autonomous scaling of the various system components, allowing the platform to handle a large number of users concurrently. Furthermore, the distributed architecture ensures reliable data persistence, availability, and openness, thereby facilitating future extensions and adaptation to evolving requirements.

Overall, the project represents a practical application of distributed systems principles within the context of a realistic web-based platform.

# 1 - Goals of the project
The main goals of the project are:

1. **Create a digital platform for social events**: provide a platform for exploring, discovering, and interacting with social events and other users.

2. **Support both public access and extended functionalities for registered users**: allow public browsing of events while offering additional functionalities for registered users and organizations.

3. **Promote interaction between users and organizations**: enable users and organizations to communicate and collaborate on the platform.

4. **Increase visibility and credibility of organizations**: enhance organizations’ reputation through active community engagement.

5. **Ensure system availability and scalability**: design the platform to handle distributed operations efficiently while maintaining responsiveness.

6. **Guarantee transparency and coherence in the distributed architecture**: ensure users perceive the platform as a reliable and consistent system, even if it is implemented as a distributed architecture.

7. **Enable future extensibility and adaptability**: design the system to easily incorporate new features, services or integrations without major changes.

## **1.1 Usage scenarios**
This section illustrates the typical interactions between the target users of the platform and the system itself. EvenToNight has been conceived for three types of users: unregistered users, registered users and users registered as organization.

The use case diagram below summarizes the main interactions of these three user types with the platform.

<p align="center">
    <img src="/case_diagram.jpeg" alt="design" width="100%" />
    <br />
</p>

A practical view of how each type of user interacts with the system according to their needs is provided in the following usage scenarios.

**Usage scenario: Browsing and filtering events, exploring other users as an unregistered user.**

- **Actor**: Unregistered user.
- **Objective**: Explore events according to location and gather information without registering an account.
- **Main flow**:
    1. The user browses the list of upcoming events.
    2. The user views event details, including photo, description, time, and location.
    3. The user applies filters to find events nearby.
    4. The user explores users registered on the platform.
- **Outcome**:
    1. The user accesses all event information without providing personal data.
    2. The user identifies events aligned with their location.
    3. The user discovers other users of the platform.

**Usage scenario: Personalized event discovery, ticket purchase and post-event review as a registered user.**

- **Actor**: Registered user.
- **Objective**: Discover events based on personal preferences, evaluate them, and purchase tickets on the platform.
- **Main flow**:
    1. The user logs in to the EvenToNight platform.
    2. The user navigates their personalized event feed, based on specified interests.
    3. The user selects an event and reads reviews of past events on the organization's page.
    4. The user purchases tickets for the event on the platform.
- **Outcome**:
    1. The user quickly finds events that match their interests.
    2. The user evaluates the organization's reliability and the type of experiences offered.
    3. The purchased ticket appears on the user's personal page and can be downloaded.
- **Post-event action**: After attending the event, the user leaves a review for the event on the organization's page, providing feedback on their experience.

**Usage scenario: Browsing the platform with personalized account settings, saving events and contact organizations as a registered user.**

- **Actor**: Registered user.
- **Objective**: Navigate the platform, save events and contact organizations via an interface customized with language and appearance preferences stored in the user account.
- **Main flow**:
    1. The user logs in to the EvenToNight platform.
    2. The user navigates the platform, displayed according to the user's saved language and appearance settings (dark or light mode).
    3. The user selects an event from the catalog and saves it to their personal list.
    4. The user contacts the organization to request additional information.
- **Outcome**:
    1. The user browses events in their preferred language and interface mode.
    2. Selected events are stored in the user's personal list.
    3. The user can easily communicate with the organization through the platform for support.

**Usage scenario: Publication of events and monitoring engagement as an organization.**

- **Actor**: User registered as organization.
- **Objective**: Publish events and monitor user engagement. 
- **Main flow**:
    1. The user logs in to the EvenToNight platform.
    2. The user creates an event as a draft.
    3. The user adds a collaborating organization to the event.
    4. The user publishes the event.
- **Outcome**:
    1. The event is successfully published and visible to platform users.  
    2. The user receives notifications about new followers and event likes, enabling monitoring of user engagement.


## **1.2 Definition of done**
The project is considered *done* when the following criteria are met:

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