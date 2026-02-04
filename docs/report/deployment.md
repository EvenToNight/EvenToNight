# 7 - Deployment

Il deploy dell’applicazione è stato automatizzato tramite Docker e Docker Compose: tutti i servizi vengono eseguiti come container indipendenti e lanciati tramite uno script centralizzato

La configurazione dell’ambiente avviene tramite file .env

```bash
cp .env.template .env
```

Tutte le variabili devono essere valorizzate affinché l’applicazione possa avviarsi correttamente. Nel caso in cui venga utilizzata l’opzione *--no-deps* le variabili relative a servizi esterni (ad esempio Stripe) possono contenere valori arbitrari, poiché tali dipendenze non vengono avviate.

Per il download dei servizi, utilizzare i sequenti comandi

```bash
./scripts/composeApplication.sh pull

// scarica i servizi e popola i database
./scripts/composeApplication.sh --init-db pull
```

Per avviare l’applicazione

```bash
./scripts/composeApplication.sh [--no-deps] up [--build, -d, --wait]

// aggiunta --init-db per popolare i db

// aggiunta --dev per esporre le porte dei servizi sull'host e rendere
// accessibili dashboard di supporto (mongo-express, rabbitmq, traefik)
```

In alternativa, è possibile avviare automaticamente l’ambiente di sviluppo completo (con popolamento, Stripe e dev mod) tramite Gradle

```bash
./gradlew setupApplicationEnvironment
```

Come ulteriore alternativa, è possibile visualizzare il sito già in produzione al link [https://eventonight.site/it](https://eventonight.site/it)