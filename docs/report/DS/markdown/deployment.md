# 7 - Deployment

The application deployment is automated with Docker and Docker Compose: all services run as independent containers and are started via a centralised script.

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

#### Option A: Use pre-built images from ghcr.io (Recommended)

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

#### Option B: Local build

Add the `--build` flag to build services locally instead of using pre-built images:

```bash
# Build and deploy
./scripts/composeApplication.sh up --build -d --wait

# Build and deploy with seeding
./scripts/composeApplication.sh --init-db up --build -d --wait
```

#### Additional flags

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

#### Stripe configuration

**For Stripe payments in a local environment** (required only if NOT using `--no-deps`):

```bash
./services/payments/scripts/local-webhooks.sh
```

This script must be run to forward Stripe webhooks to the local environment.

For more information on using sandbox mode, refer to the [Stripe documentation](https://docs.stripe.com/testing).

### Alternative setup

Use Gradle to set up the entire environment with seeding and the Stripe listener:

```bash
./gradlew setupApplicationEnvironment
```

### Teardown

**Stop the application:**
```bash
./scripts/composeApplication.sh down
```

**Stop and remove volumes:**
```bash
./scripts/composeApplication.sh down -v
```

---

Alternatively, the application is already running in production at [https://eventonight.site/it](https://eventonight.site/it)
