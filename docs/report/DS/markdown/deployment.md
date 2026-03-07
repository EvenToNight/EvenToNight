# 7 - Deployment

The application supports two deployment modes: **Docker Compose** for single-node setups, and **Docker Swarm** (beta) for multi-node, highly available deployments. In both cases, all services run as independent containers and are managed via a centralised script.

## 7.1 - Installation

### 1. Clone the repository

```bash
git clone https://github.com/EvenToNight/EvenToNight.git
cd EvenToNight
```

### 2. Configure environment variables

```bash
cp .env.template .env
# Edit .env and fill in all required fields
# Note: if using the --no-deps flag, Stripe keys can contain arbitrary values. All fields must still be filled in.
```

### 3. Start the application

#### 3.1 - Docker Compose

##### Option A: Use pre-built images from ghcr.io (Recommended)

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

**Deploy in development mode** (with host-mapped ports and dashboards for databases, RabbitMQ, and Traefik):
```bash
./scripts/composeApplication.sh --init-db --dev up -d --wait
```

##### Option B: Local build

Add the `--build` flag to build services locally instead of using pre-built images. The `--dev` flag is required as it includes the build instructions:

```bash
# Build and deploy
./scripts/composeApplication.sh --dev up --build -d --wait

# Build and deploy with seeding
./scripts/composeApplication.sh --init-db --dev up --build -d --wait
```

##### Additional flags

**`--no-deps`**: Excludes external dependencies (Stripe)

The `--no-deps` flag can be added to any deploy command to exclude external services:

```bash
# Deploy without external dependencies
./scripts/composeApplication.sh --no-deps up -d --wait

# Deploy with seeding but without external dependencies
./scripts/composeApplication.sh --init-db --no-deps up -d --wait
```

**Note:** When using `--no-deps`, the Stripe keys **(STRIPE_SECRET_KEY,
STRIPE_PUBLISHABLE_KEY,
STRIPE_WEBHOOK_SECRET)** in `.env` can contain arbitrary values.

**`--project-name`**: Overrides the Docker Compose project name (defaults to `eventonight`):

```bash
./scripts/composeApplication.sh --project-name myproject up -d --wait
```

##### Stripe configuration

**For Stripe payments in a local environment** (required only if NOT using `--no-deps`):

```bash
./services/payments/scripts/local-webhooks.sh
```

This script must be run to forward Stripe webhooks to the local environment.

For more information on using sandbox mode, refer to the [Stripe documentation](https://docs.stripe.com/testing).

##### Alternative setup

Use Gradle to set up the entire environment with seeding and the Stripe listener:

```bash
./gradlew setupApplicationEnvironment
```

##### Teardown

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

#### 3.2 - Docker Swarm (beta)

##### Prerequisites

Initialise the swarm on the manager node:

```bash
docker swarm init
```

Join additional worker nodes using the token provided by the manager:

```bash
docker swarm join --token <token> <manager-ip>:2377
```

##### Option A: Use pre-built images from ghcr.io (Recommended)

```bash
./scripts/deploySwarm.sh
```

The `--auto-labels` flag can be added to automatically assign placement labels to nodes in a balanced way, without having to configure them manually:

```bash
./scripts/deploySwarm.sh --auto-labels
```

**Note:** On the first deploy, database seeding is performed automatically.

##### Option B: Local build

Build images locally and push them to Docker Hub (multi-arch) so all workers have access to them, then deploy:

```bash
./scripts/deploySwarm.sh --local --build
```

To override the hostname baked into the frontend image (defaults to `HOST` from `.env`, e.g. to use `localhost` for local testing):

```bash
./scripts/deploySwarm.sh --local --build --host <hostname> --auto-labels
```

To deploy using already-pushed local images (without rebuilding):

```bash
./scripts/deploySwarm.sh --local
```

To build and push without deploying:

```bash
./scripts/deploySwarm.sh --build
```

##### Additional flags

**`--no-deps`**: Same behaviour as in Docker Compose: excludes external dependencies. Stripe configuration applies equally (see 3.1 - Stripe configuration).

```bash
./scripts/deploySwarm.sh --no-deps
```

**`--stack-name`**: Overrides the stack name (defaults to `eventonight-swarm`):

```bash
./scripts/deploySwarm.sh --stack-name mystack
```

##### Recovery

If some services are not fully running after a deploy, the recovery script force-updates only the failing ones:

```bash
./scripts/swarmRecover.sh [STACK_NAME]
```

To check the current status of all services without recovering:

```bash
./scripts/swarmRecover.sh [STACK_NAME] --status
```

`STACK_NAME` defaults to `eventonight-swarm`.

##### Teardown

**Remove the stack:**
```bash
./scripts/deploySwarm.sh --stop
```

**Remove the stack and volumes:**
```bash
./scripts/deploySwarm.sh --stop --remove-volumes
```

**Remove test images from docker hub**
```bash
./scripts/deploySwarm.sh --remove-local-images
```

---

Alternatively, the application is already running in production at [https://eventonight.site/it](https://eventonight.site/it)
