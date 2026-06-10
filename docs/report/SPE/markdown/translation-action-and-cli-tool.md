# 4 - Translation Action and CLI Tool

Dato che come requisito il frontend dell'applicazione doveva essere internazionalizzato sono state adottate delle strategie per rendere il lavoro più semplice e rapido. Le lingue in cui è stato reso disponibile sono 5, Inglese, Italiano, Spagnolo, Francese e Tedesco.

Since keeping five transaltion files perfectly aligned by hand is tedious and error-prone is chosen the English transaltion file as the source of truth and is devaloped a cli tool [**`auto-i18n`**](https://github.com/EvenToNight/auto-i18n) to sync and check transaltion files.

the tool is developed as an **independent repository** and is distributed in two complementary forms built around a single shared core:

- a **GitHub Action**, invoked from the CI pipeline (see [DevOps](/devops)) to translate on push and to gate pull requests;
- an **npm CLI** (`@eventonight/auto-i18n`), for running the same translation locally during development.