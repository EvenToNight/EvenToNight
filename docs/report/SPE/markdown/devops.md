# 3 - DevOps

## 3.1 - Build Automation

### Gradle as a multi-language orchestrator

Gradle is the project's primary build system, set up as a single multi-project build. The root holds two files: `build.gradle.kts`, defining project-wide tasks (environment setup, Docker environment orchestration and git pre-commit helpers), and `settings.gradle`, which registers every subproject and configures the git hooks.

Each service is a Gradle subproject, but the build spans different languages. JVM/Scala services (`events`, `users`) build natively through Gradle, while JS/TS services (`chat`, `interactions`, `media`, `notifications`, `ticketing` and the `frontend`) are wrapped via the node-gradle plugin, which delegates the actual work to npm. A single Gradle invocation thus drives heterogeneous toolchains behind one uniform task interface.

The monorepo layout was preferred because it enables:
- **unified build and CI**: one Gradle invocation builds, checks and tests the whole system, and a single CI pipeline validates every service;
- **frictionless code sharing**: the libraries under `libs/` are consumed directly by the Node services, with no external registry publishing;
- **single versioning** for the whole product;
- **simplicity for a small team**: one repository, one build and one set of conventions keep the maintenance and cognitive overhead low.

### Convention plugins and custom tasks

To avoid duplicating build logic, `buildSrc/` defines two **convention plugins**, one for the Scala services and one for the JS/TS ones. Each encapsulates the language-specific compilation, style and coverage setup and exposes it under a common set of task names.

A custom `ExecTask` further simplifies running arbitrary shell commands, with sequential chaining, `onSuccess`/`onFailure` callbacks and built-in cross-platform support. Shared constants are also defined alongside it under `buildSrc/`.

### Git hooks

Hooks are installed through the [`gradle-pre-commit-git-hooks`](https://plugins.gradle.org/plugin/org.danilopianini.gradle-pre-commit-git-hooks/2.1.5) plugin configured in `settings.gradle`. Two **pre-commit** hooks are registered:
- **`formatAndLintPreCommit`** runs the format-and-lint task (which every subproject configures via its convention plugin), then re-stages the files that were staged at commit time, so any style fix is included in the commit;
- **`updateAndCheckEnvSetup`** updates `.env` from `.env.template` (adding any missing variable) and verifies that both files share the same keys and that `.env` values are populated, so a variable added only to the local `.env` cannot be pushed without also being declared in the shared `.env.template`.

A **commit-msg** hook additionally validates the commit message against the Conventional Commits convention.

## 3.2 - Dockerization

### Dockerfile design

Every service ships its own `Dockerfile`, designed around two goals: **layer caching** and **minimal image size**. Instructions are ordered properly for maximising cache reuse, and each image uses a **two-stage build**: a builder stage compiles the artifact while the final stage carries only the runtime plus the built output.

### Docker Compose layer system

Every service and infrastructure component defines its Compose files, which are not standalone: utility scripts (`findComposeFiles.sh`, `composeAll.sh`) discover them and **merge them in layers**, each adding a concern on top of the previous one:

- **base** (`docker-compose-base.yml`) — the canonical service definition: image, networks, environment and healthchecks;
- **main** (`docker-compose.yaml`) — production-oriented overrides: restart policy, Traefik routing labels and `depends_on` conditions;
- **dev** (`docker-compose-dev.yaml`) — development extras: local image `build`, exposed host ports and dev tooling (e.g. mongo-express);
- **swarm** (`docker-compose-swarm.yaml`) — Swarm-specific settings: `deploy` (replicas, placement constraints, restart policy), overlay networks and configs.

A standard deploy merges `base → main`; a development environment adds `dev` on top; a Swarm deploy (beta) merges `base → swarm` instead of the main file.

## 3.3 - DVCS

### Git Flow

The repository follows a Git-Flow-inspired strategy: a single long-lived branch, `main`, updated exclusively through a **pull request** from feature branches. The merge strategy depends on the PR: small changes whose individual history carries little value are **rebased** to keep the history linear, while larger feature branches are integrated with **merge commits**, preserving the branch topology.

### Branch protection

`main` is protected by a set of rules:
- changes must arrive through a pull request **reviewed and approved by at least one other team member**;
- the required CI status checks must pass before merging;
- direct pushes to `main` are blocked; the only whitelisted identity is a dedicated **GitHub App**, whose token lets the release workflow push the generated CHANGELOG.

Pull requests to `main` also enable automatic **Copilot review**, which gives an immediate first-pass on every PR, flagging obvious bugs and smells before a human reviewer steps in.

### Environment and secrets

The `.env.template` file is the authoritative schema for the environment. Configuration variables are given a default value, while API keys and passwords are left empty. The `checkEnvSetup` task leverages this convention to enforce two properties:
1. it **fails on empty values**, forcing real secrets to be provided locally and removing the risk of shipping placeholder credentials;
2. it **fails on key mismatches** between `.env` and `.env.template`, keeping the schema in sync.

To still allow building and testing in CI the pipeline injects default passwords before the check runs. Variables and secrets actually needed by the workflows are stored as **GitHub Actions Variables/Secrets**.

## 3.4 - CI/CD Pipelines

### Quality gates on pull requests

Three workflows act as quality gates on every pull request to `main`:

- **`build-and-test.yml`** runs `./gradlew clean build` across all services (compile, check and test) and uploads coverage reports to **Codecov**; on pull requests it additionally detects which `Dockerfiles` changed and builds those images, validating that they build cleanly before the code lands.
- **`check-style.yml`** runs `./gradlew checkStyle` to verify linting and formatting.
- **`check-commit-convention.yml`** inspects every commit in the PR and validates it against the Conventional Commits specification.

Style and commit-convention checks are also enforced as git hooks, but they are re-checked in CI because hooks can be bypassed locally.

### Translation check

The **`auto-i18n.yml`** workflow runs the project's own `auto-i18n` action on pushes to the frontend feature branch (`feature/frontend-service`) and on every pull request. On push it generates the missing translations and commits them; on pull requests it runs in **check-only** mode. To avoid re-triggering the pipeline on the auto-generated commit, the commit message carries `[skip ci]`, which is omitted when a PR is already open from that branch, so that all required checks still run.

### GitHub Pages

The **`deploy-pages.yml`** workflow triggers on pushes to `main` and to any `docs/*` branch. It builds the three VitePress report sites (ASW, DS, SPE), copies the static assets and the OpenAPI/AsyncAPI specifications into the output tree, and publishes everything to **GitHub Pages**.

### Release and Deploy

Every push to `main` triggers the `release.yml` pipeline, which first decides whether a release is needed:
- **semantic-release** inspects the commits and publishes a new versioned release following Conventional Commits + SemVer;
- if no release is published but `services/` or `infrastructure/` changed, the pipeline falls back to an incremental **dev pre-release** (e.g. `v1.4.0-dev.2`), so that every meaningful change still produces a deployable tag.

When a tag is produced, the pipeline finds all modified directories containing a `Dockerfile`, then builds and pushes the corresponding **multi-arch images** (`linux/amd64` + `linux/arm64`, via Buildx and QEMU) to `ghcr.io`. The service name is derived from the Dockerfile path (e.g. `services/chat/Dockerfile` → `chat`). Each image is pushed under two tags: the **release version** (e.g. `chat:2.2.2`) and **`:latest`**.

The deployed production infrastructure is the following:

![Deployed infrastructure](/devops/deployed-infrastructure.png)

The deploy job then opens an SSH session to the production server through a **Cloudflare Tunnel**: the connection is authenticated via Cloudflare Access and bridged through Cloudflare's network, so no SSH port is exposed publicly. On the remote machine the repository is pulled, the new images are pulled from the registry and the stack is redeployed via `composeApplication.sh`.

A **Docker Swarm** deployment path is also available (still in beta): `scripts/swarmDeploy.sh` manages the full Swarm lifecycle, including pushing the images to Docker Hub so they are reachable from every swarm node.
