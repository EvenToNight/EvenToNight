# 1 - Introduction
The project consists of the design and development of a distributed digital platform called [**EvenToNight**](https://eventonight.site/), aimed at connecting organizations that promote social events with users interested in discovering and participating in them.

This report presents the project from the perspective of the **software development process** and the **DevOps** practices adopted throughout its development, including build automation, versioning, quality assurance, deployment and continuous integration / continuous delivery (CI/CD) pipelines.

From a technical perspective, EvenToNight is designed as a **multi-language, containerized and distributed microservices system** and the entire codebase is organized as a **monorepo**, where all services, shared libraries, infrastructure and documentation live in a single Git repository.

## Project Requirements

- **Meaningful Microservices architecture**: design and implement a meaningful division into independent microservices leveraging DDD.
- **Multi-platform**: microservices implemented on at least two different platforms — **Node.js** and the **JVM**.
- **Build automation**: unified build orchestration with **Gradle** across all services and languages.
- **CI/CD pipelines**: automated pipelines covering building, testing, convention enforcement (e.g. Conventional Commits), documentation deployment, Docker image publishing to a registry, and automated deployment to a test environment.

## Process Organization

### Version control

- **Git**: the team adopted GitHub Flow — `main` is the only release branch and is protected via branch protection rules; working branches are merged into `main` exclusively via pull request subject to **code review** and automated checks.
- **Commit convention**: all commits follow the [**Conventional Commits**](https://www.conventionalcommits.org/en/v1.0.0/) specification.
- **Branch convention**: all branches follow the [**Conventional Branch**](https://conventionalbranch.org/) specification (prefixed `feature/`, `refactor/`, `ci/`, `docs/`).

### Build and quality

- **Build system**: **Gradle** is used as the single build orchestrator; each microservice is a Gradle subproject, including Node.js services, which are integrated via the node-gradle plugin.
- **Linting and formatting**: configured per microservice according to its language and ecosystem.
- **Testing**: each microservice has its own test suite, targeting an overall coverage of **70%**.

### Release and deployment

- **Semantic versioning**: versions are derived automatically from the commit convention via **semantic-release**.
- **Dockerization**: each service is packaged as a Docker image and published to a container registry (**ghcr.io**).
- **Deployment**: the system must be deployed to a test environment.