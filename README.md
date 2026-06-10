[![Contributors][contributors-shield]][contributors-url]
[![Forks][forks-shield]][forks-url]
[![Stargazers][stars-shield]][stars-url]
[![Issues][issues-shield]][issues-url]
[![License][license-shield]][license-url]

<!-- PROJECT LOGO -->
<br />
<p align="center">
  <a href="https://github.com/EvenToNight/EvenToNight">
    <img src="./docs/logo.png" alt="Logo" width="256" height="256" />
  </a>

  <h3 align="center">EvenToNight</h3>

  <p align="center">
    Your social platform for events
    <br />
    <a href="https://eventonight.github.io/EvenToNight/"><strong>Explore the docs »</strong></a>
    <br />
    <br />
    <a href="https://eventonight.site/">View Demo</a>
    ·
    <a href="https://github.com/EvenToNight/EvenToNight/issues">Report Bug</a>
    ·
    <a href="https://github.com/EvenToNight/EvenToNight/issues">Request Feature</a>
  </p>
</p>

---

<!-- TABLE OF CONTENTS -->
<details>
  <summary>Table of Contents</summary>
  <ol>
    <li>
      <a href="#about-the-project">About The Project</a>
      <ul>
        <li><a href="#key-features">Key Features</a></li>
        <li><a href="#built-with">Built With</a></li>
      </ul>
    </li>
    <li>
      <a href="#getting-started">Getting Started</a>
      <ul>
        <li><a href="#prerequisites">Prerequisites</a></li>
        <li><a href="#installation">Installation</a></li>
      </ul>
    </li>
    <li><a href="#usage">Usage</a></li>
    <li><a href="#project-structure">Project Structure</a></li>
    <li><a href="#contributing">Contributing</a></li>
    <li><a href="#license">License</a></li>
    <li><a href="#contact">Contact</a></li>
    <li><a href="#acknowledgements">Acknowledgements</a></li>
  </ol>
</details>

## About The Project

**EvenToNight** is a digital platform designed to connect organizations promoting social events with users interested in discovering and participating in them. The platform features a **social network-style interface**, making the user experience simple, intuitive, and engaging.

The platform is accessible **without authentication**, allowing users to browse public events without creating an account, while providing organizations with a **public showcase** to promote their activities and reach a wider audience.

Users can register as either **organizations** or **members**, each with tailored features and capabilities. Registered users gain access to the complete set of platform features, including:

- **Save favorite content** and manage personalized collections
- **Follow organizations and members** to stay updated on new events and activities
- **Real-time chat service** to contact organizations for technical assistance and event information
- **Review system** to leave feedback on attended events, contributing to organization credibility
- **Intelligent search and filtering** by newest additions, trending events, personal interests, and location
- **Collaborative events** where organizations can specify collaborators to co-host events and grow their community

<!-- Add a demo gif or screenshot here -->
<!--
<p align="center">
  <a href="https://github.com/EvenToNight/EvenToNight">
    <img src="./docs/demo.gif" alt="Demo" width="640" height="410" />
  </a>
</p>
-->

The platform supports **internationalization (i18n)**.

### Built With

**Frontend**
- Vue 3
- TypeScript
- Quasar Framework
- Pinia
- Vue Router
- Vue I18n
- Socket.io Client
- Vite

**Backend (Microservices)**
- Scala 3
- Cask
- Circe
- Undertow
- NestJS
- Express
- Node.js
- MongoDB
- Mongoose
- RabbitMQ
- JWT
- Socket.io
- Stripe
- PDFKit
- QRCode
- AWS S3
- Multer
- STTP
- Gradle

**Infrastructure & DevOps**
- Docker & Docker Compose
- Keycloak
- Traefik

**Testing & Quality**
- Jest
- ScalaTest
- Lighthouse
- ESLint
- Prettier
- ScalaFix
- ScalaFmt

## Getting Started

The application supports two deployment modes: **Docker Compose** for single-node setups and **Docker Swarm** (beta) for multi-node, highly available deployments. In both cases, all services run as independent containers and are managed via a centralised script.

### Prerequisites

- [Java](https://www.oracle.com/java/technologies/downloads/) 21 or higher
- [Docker](https://www.docker.com/)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/EvenToNight/EvenToNight.git
cd EvenToNight
```

#### 2. Configure environment variables

```bash
cp .env.template .env
# Edit .env and fill in all required fields
# Note: if using the --no-deps flag, Stripe keys can contain arbitrary values. All fields must still be filled in.
```

#### 3. Start the application

##### 3.1 - Docker Compose

###### Option A: Use pre-built images from ghcr.io (Recommended)

**Pull images:**
```bash
./scripts/composeApplication.sh pull
```

**Pull images with database seeding:**
```bash
./scripts/composeApplication.sh --init-db pull
```

**Deploy the application:**
```bash
./scripts/composeApplication.sh up -d --wait
```

**Deploy with database seeding:**
```bash
./scripts/composeApplication.sh --init-db up -d --wait
```

**Deploy in development mode** (with host-mapped ports and dashboards for databases, RabbitMQ and Traefik):
```bash
./scripts/composeApplication.sh --init-db --dev up -d --wait
```

###### Option B: Local build

Add the `--build` flag to build services locally instead of using pre-built images. The `--dev` flag is required as it includes the build instructions:

```bash
# Build and deploy
./scripts/composeApplication.sh --dev up --build -d --wait

# Build and deploy with seeding
./scripts/composeApplication.sh --init-db --dev up --build -d --wait
```

###### Additional flags

**`--no-deps`**: Excludes external dependencies (Stripe)

The `--no-deps` flag can be added to any deploy command to exclude external services:

```bash
# Deploy without external dependencies
./scripts/composeApplication.sh --no-deps up -d --wait

# Deploy with seeding but without external dependencies
./scripts/composeApplication.sh --init-db --no-deps up -d --wait
```

**Note:** When using `--no-deps`, the Stripe keys (`STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`, `STRIPE_WEBHOOK_SECRET`) in `.env` can contain arbitrary values.

**`--project-name`**: Overrides the Docker Compose project name (defaults to `eventonight`):

```bash
./scripts/composeApplication.sh --project-name myproject up -d --wait
```

###### Stripe configuration

**For Stripe payments in a local environment** (required only if NOT using `--no-deps`):

```bash
./services/ticketing/scripts/local-webhooks.sh
```

This script must be run to forward Stripe webhooks to the local environment.

For more information on using sandbox mode, refer to the [Stripe documentation](https://docs.stripe.com/testing).

###### Alternative setup

Use Gradle to set up the entire environment with seeding and the Stripe listener:

```bash
./gradlew setupApplicationEnvironment
```

###### Teardown

**Stop the application:**
```bash
./scripts/composeApplication.sh down
```

**Stop and remove volumes:**
```bash
./scripts/composeApplication.sh down -v
```

Or using Gradle:
```bash
./gradlew teardownApplicationEnvironment
```

##### 3.2 - Docker Swarm (beta)

###### Prerequisites

Initialise the swarm on the manager node:

```bash
docker swarm init
```

Join additional worker nodes using the token provided by the manager:

```bash
docker swarm join --token <token> <manager-ip>:2377
```

###### Option A: Use pre-built images from ghcr.io (Recommended)

```bash
./scripts/swarmDeploy.sh
```

The `--auto-labels` flag can be added to automatically assign placement labels to nodes in a balanced way, without having to configure them manually:

```bash
./scripts/swarmDeploy.sh --auto-labels
```

**Note:** On the first deploy, database seeding is performed automatically.

###### Option B: Local build

Build images locally and push them to Docker Hub (multi-arch) so all workers have access to them, then deploy:

```bash
./scripts/swarmDeploy.sh --local --build
```

To override the hostname baked into the frontend image (defaults to `HOST` from `.env`, e.g. to use `localhost` for local testing):

```bash
./scripts/swarmDeploy.sh --local --build --host <hostname> --auto-labels
```

To deploy using already-pushed local images (without rebuilding):

```bash
./scripts/swarmDeploy.sh --local
```

To build and push without deploying:

```bash
./scripts/swarmDeploy.sh --build
```

###### Additional flags

**`--no-deps`**: same behaviour as in Docker Compose: excludes external dependencies. Stripe configuration applies equally (see *Stripe configuration* above).

```bash
./scripts/swarmDeploy.sh --no-deps
```

**`--stack-name`**: Overrides the stack name (defaults to `eventonight-swarm`):

```bash
./scripts/swarmDeploy.sh --stack-name mystack
```

###### Recovery

If some services are not fully running after a deploy, the recovery script force-updates only the failing ones:

```bash
./scripts/swarmRecover.sh [STACK_NAME]
```

To check the current status of all services without recovering:

```bash
./scripts/swarmRecover.sh [STACK_NAME] --status
```

`STACK_NAME` defaults to `eventonight-swarm`.

###### Teardown

**Remove the stack:**
```bash
./scripts/swarmDeploy.sh --stop
```

**Remove the stack and volumes:**
```bash
./scripts/swarmDeploy.sh --stop --remove-volumes
```

**Remove test images from Docker Hub:**
```bash
./scripts/swarmDeploy.sh --remove-local-images
```

---

Alternatively, the application is already running in production at [EvenToNight](https://eventonight.site/it).

## Usage

### For Event Organizers

1. **Create an Account**: Sign up as an event organizer
2. **Create Events**: Fill in event details, upload posters, set dates and locations
3. **Manage Tickets**: Configure ticket types and pricing

### For Attendees

1. **Discover Events**: Browse and search for events based on your interests
2. **Purchase Tickets**: Secure your spot with integrated ticket purchasing
3. **Stay Connected**: Follow organizers and other attendees
4. **Share Feedback**: Rate and review events you've attended

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/amazing-feature`)
3. Commit your Changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the Branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Coding Standards

- Follow the existing code style
- Write meaningful commit messages using [Conventional Commits](https://www.conventionalcommits.org/)
- Add tests for new features
- Ensure accessibility compliance
- Update documentation as needed

## License

Distributed under the GPL-3.0 License. See [LICENSE](LICENSE) for more information.

## Authors

- [Federico Bravetti](https://github.com/Fede802)
- [Tommaso Brini](https://github.com/TommasoBrini)
- [Alice Alfonsi](https://github.com/alicealfonsi)



<!-- MARKDOWN LINKS & IMAGES -->
[contributors-shield]: https://img.shields.io/github/contributors/EvenToNight/EvenToNight.svg?style=flat-square
[contributors-url]: https://github.com/EvenToNight/EvenToNight/graphs/contributors
[forks-shield]: https://img.shields.io/github/forks/EvenToNight/EvenToNight.svg?style=flat-square
[forks-url]: https://github.com/EvenToNight/EvenToNight/network/members
[stars-shield]: https://img.shields.io/github/stars/EvenToNight/EvenToNight.svg?style=flat-square
[stars-url]: https://github.com/EvenToNight/EvenToNight/stargazers
[issues-shield]: https://img.shields.io/github/issues/EvenToNight/EvenToNight.svg?style=flat-square
[issues-url]: https://github.com/EvenToNight/EvenToNight/issues
[license-shield]: https://img.shields.io/github/license/EvenToNight/EvenToNight.svg?style=flat-square
[license-url]: https://github.com/EvenToNight/EvenToNight/blob/main/LICENSE
