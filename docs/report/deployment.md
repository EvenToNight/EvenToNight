# 7 - Deployment

Il deploy dell'applicazione è stato automatizzato tramite Docker e Docker Compose: tutti i servizi vengono eseguiti come container indipendenti e lanciati tramite uno script centralizzato.

## 7.1 - Installazione

### 1. Clonare il repository

```bash
git clone https://github.com/EvenToNight/EvenToNight.git
cd EvenToNight
```

### 2. Configurare le variabili d'ambiente

```bash
cp .env.template .env
# Modificare .env e compilare tutti i campi richiesti
# Nota: Se si utilizza il flag --no-deps, le chiavi Stripe possono contenere valori arbitrari. Tutti i valori devono essere compilati.
```

### 3. Avviare l'applicazione

#### Opzione A: Utilizzo di immagini pre-compilate da ghcr.io (Consigliato)

**Download delle immagini:**
```bash
./scripts/composeApplication.sh pull
```

**Download delle immagini con seeding del database:**
```bash
./scripts/composeApplication.sh --init-db pull
```

**Deploy dell'applicazione:**
```bash
./scripts/composeApplication.sh up -d --wait
```

**Deploy con seeding del database:**
```bash
./scripts/composeApplication.sh --init-db up -d --wait
```

**Deploy in modalità sviluppo** (con porte mappate sull'host e dashboard per database/RabbitMQ/Traefik):
```bash
./scripts/composeApplication.sh --init-db --dev up -d --wait
```

#### Opzione B: Build locale

Aggiungere il flag `--build` per compilare i servizi localmente invece di utilizzare le immagini pre-compilate:

```bash
# Build e deploy
./scripts/composeApplication.sh up --build -d --wait

# Build e deploy con seeding
./scripts/composeApplication.sh --init-db up --build -d --wait
```

#### Flag aggiuntivi

**`--no-deps`**: Esclude le dipendenze esterne (Stripe)

È possibile aggiungere `--no-deps` a qualsiasi comando di deploy per escludere i servizi esterni:

```bash
# Deploy senza dipendenze esterne
./scripts/composeApplication.sh --no-deps up -d --wait

# Deploy con seeding ma senza dipendenze esterne
./scripts/composeApplication.sh --init-db --no-deps up -d --wait
```

**Nota:** Quando si utilizza `--no-deps`, le chiavi Stripe **(STRIPE_SECRET_KEY,
STRIPE_PUBLISHABLE_KEY,
STRIPE_WEBHOOK_SECRET)** in `.env` possono contenere valori arbitrari.

#### Configurazione Stripe

**Per i pagamenti Stripe in ambiente locale** (richiesto solo se NON si utilizza `--no-deps`):

```bash
./services/payments/scripts/local-webhooks.sh
```

Questo script deve essere eseguito per inoltrare i webhook di Stripe all'ambiente locale.

Per maggiori informazioni sull'utilizzo della modalità sandbox, consultare la [documentazione Stripe](https://docs.stripe.com/testing).

### Setup alternativo

Utilizzare Gradle per configurare l'intero ambiente con seeding e listener Stripe:

```bash
./gradlew setupApplicationEnvironment
```

### Teardown

**Arresto dell'applicazione:**
```bash
./scripts/composeApplication.sh down
```

**Arresto e rimozione dei volumi:**
```bash
./scripts/composeApplication.sh down -v
```

---

Come ulteriore alternativa, è possibile visualizzare il sito già in produzione al link [https://eventonight.site/it](https://eventonight.site/it)
