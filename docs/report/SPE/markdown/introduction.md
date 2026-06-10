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

## Versioning

The project adopts **Semantic Versioning** (SemVer): version numbers follow the `MAJOR.MINOR.PATCH` scheme, where a breaking change increments `MAJOR`, a new backward-compatible feature increments `MINOR`, and a bug fix increments `PATCH`. Version bumps are **fully automated** via [**semantic-release**](https://semantic-release.gitbook.io/semantic-release/) using the `conventionalcommits` preset: on every push to `main` the tool inspects the commit history since the last tag and derives the next version.
- `feat:` triggers a minor bump, 
- `fix:` a patch bump, 
- `BREAKING CHANGE` footer a major bump.

Each Docker image is published to **ghcr.io** with two tags: the exact SemVer tag (e.g. `v1.2.3`) and `latest`, always pointing to the most recent release. When a push to `main` modifies service or infrastructure files but does not contain commits that trigger a semantic-release bump (e.g. only `chore:` or `docs:` commits), the pipeline automatically creates a **dev pre-release** tag in the form `vMAJOR.MINOR.(PATCH+1)-dev.N` (e.g. `v1.2.4-dev.1`, `v1.2.4-dev.2`, …). 

These pre-release images are still published to the registry so that the staging environment always runs an up-to-date build, while being clearly distinguishable from production releases.

## Licensing

EvenToNight is released under the **GNU General Public License v3.0** (GPL-3.0), a **strong copyleft** license. The key distinction from permissive alternatives is the copyleft obligation: anyone who distributes a modified version of the software must do so under the same license, ensuring that the source remains open through any chain of redistribution.

**MIT** and **Apache 2.0** are permissive licenses, they impose no such obligation, allowing modified versions to be incorporated into proprietary closed-source products without any requirement to publish the changes. Apache 2.0 additionally provides an explicit patent grant, but shares the same permissive stance on distribution.

Given the academic and open-source nature of this project, a copyleft license best reflects the intent to keep the codebase and any derivative works freely available and inspectable.