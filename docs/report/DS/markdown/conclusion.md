# **9 Conclusions**
We are satisfied with the platform developed, which originated from our business idea. The main achievements are:

- **Achievements of project goals.**
All project goals were reached, with particular focus on aspects defining a distributed system. The system consists of isolated, loosely coupled components that appear to users as a single coherent platform.
- **Requirements fulfillment.**
All functional and non-functional requirements were satisfied, with iterative refinement based on feedback from potential users.
- **Microservices architecture design.**
The system was designed as a collection of independent services with clear boundaries. Backend microservices communicate and coordinate via network-based mechanisms and expose well-defined REST APIs used by the frontend.
- **Distributed architecture implementation.**
Services were containerized using Docker and orchestrated with Docker Swarm, simulating a distributed environment with service isolation and internal networking.
- **Modularity and extensibility.**
The architecture provides a clear separation of concerns, ensuring maintainability, easy addition of new features, and future scalability. The modular design also facilitated parallel development of different functionalities.

## **9.1 Future Works**
Although the platform was designed according to distributed principles, it was deployed on a single physical machine. As a result, the system does not provide real high availability: if the host machine fails, all services become unavailable. Future improvements could include deployment on multiple physical or virtual machines to achieve infrastructure-level fault tolerance and resilience.

From a functional perspective, potential extensions include:

- Allowing organizations to respond to reviews.
- Additional notifications, such as friendship suggestions and updates on liked events.
- Profile insights and statistics.
- Refund management.
- Multi-currency support to enhance internationalization.

## **9.2 What we learned**
This project allowed us to apply distributed system concepts that we had previously studied only from a theoretical perspective. In particular:

- We gained practical experience with the trade-offs between consistency and availability in the presence of network partitions, as described by the CAP theorem.
- We experimented with containerization and faced challenges in guaranteeing consistency when introducing replication.
- We gained a deeper understanding of service decoupling, transparency, reliability, and the difference between simulated distribution and real infrastructure-level fault tolerance.