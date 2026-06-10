# 4 - Translation Action and CLI Tool

Dato che come requisito il frontend dell'applicazione doveva essere internazionalizzato sono state adottate delle strategie per rendere il lavoro più semplice e rapido. Le lingue in cui è stato reso disponibile sono 5, Inglese, Italiano, Spagnolo, Francese e Tedesco.

Since keeping five transaltion files perfectly aligned by hand is tedious and error-prone is chosen the English transaltion file as the source of truth and is devaloped a cli tool [**`auto-i18n`**](https://github.com/EvenToNight/auto-i18n) to sync and check transaltion files.

the tool is developed as an **independent repository** and is distributed in two complementary forms built around a single shared core:

- a **GitHub Action**, invoked from the CI pipeline (see [DevOps](/devops)) to translate on push and to gate pull requests;
- an **npm CLI** (`@eventonight/auto-i18n`), for running the same translation locally during development.

<!-- NUOVA VERSIONE -->

Internationalising the frontend was a project requirement: the application is offered in five languages — English, Italian, Spanish, French and German. Keeping five translation files aligned by hand is tedious and error-prone, so **English was chosen as the source of truth** and a dedicated tool, [**`auto-i18n`**](https://github.com/EvenToNight/auto-i18n), was developed to keep the other locale files in sync and to verify their completeness.

The tool lives in an **independent repository** and is distributed in two complementary forms built around a single shared core:

- a **GitHub Action**, invoked from the CI pipeline (see [DevOps](/devops)) to translate on push and to gate pull requests;
- an **npm CLI** (`@eventonight/auto-i18n`), for running the same translation locally during development.