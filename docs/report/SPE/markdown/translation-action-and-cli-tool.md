# 4 - Translation Action and CLI Tool

Internationalising the frontend was a project requirement: the application is offered in five languages: English, Italian, Spanish, French and German. Keeping five translation files aligned by hand is tedious and error-prone, so **English was chosen as the source of truth** and a dedicated tool, [**`auto-i18n`**](https://github.com/EvenToNight/auto-i18n), was developed to keep the other locale files in sync and to verify their completeness.

The tool lives in an **independent repository** and is distributed in two complementary forms built around a single shared core:

- a **GitHub Action**, invoked from the CI pipeline (see [DevOps](/devops)) to translate on push and to gate pull requests;
- an **npm CLI** (`@eventonight/auto-i18n`), for running the same translation locally during development.