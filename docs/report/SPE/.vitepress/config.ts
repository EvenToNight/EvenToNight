import { defineConfig } from 'vitepress'
import { fileURLToPath } from 'url'
import path from 'path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
    base: process.env.NODE_ENV === 'production' ? "/EvenToNight/report/SPE/" : "/",
    srcDir: "./markdown",
    title: "Report Progetto SPE",
    head: [
        ["link", { rel: "icon", type: "image/png", href: "./logo.png" }]
    ],
    vite: {
        publicDir: path.resolve(__dirname, '../public'),
        server: {
            allowedHosts: ['.ngrok-free.dev']
        }
    },
    themeConfig: {
        sidebar: [
        {
            //versioning e licensing?
            //piu linguaggi, docker images per due arch. multi target, vue web/node backend?
            //currency converter 
//             This choice is motivated by:

//              - **unified build and CI**: a single Gradle invocation builds, checks and tests the whole system, and one CI pipeline validates every service;
//              - **code sharing**: the libraries under `libs/` are consumed by the Node services without publishing to external registries;
//              - **atomic cross-service changes**: a single pull request can coherently modify multiple services and their configuration;
//              - **single versioning and changelog** for the whole product.
            items: [
                { text: "Introduction", link: "/introduction" },// { text: "Versioning e Licensing", link: "/versioning-e-licensing" }, //due robe su semantic versioning e come vengono versionate le immagini docker + dev pre release + perche abbiamo scelto gpl invece che le altre (apache/mit)
                { text: "Design", link: "/design" }, //tecnologie qua sotto? DDD - tommi (event storming, ubiquitus language/glossario, come si mappano i domain in microservices, domain events, shared kernel (o solo concetti replicati) o solo lib condivise, acl?, architettura dei microservizi(clean + setup cors)?)
                { text: "DevOps", link: "/devops" }, //build automation (con nota a struttura monorepo) gradle setup + exec tasks + git hooks + building?scripting? , gestione Dockerization, CI/QA pipeline (anche test & coverage) and documentation(forse poco devOps però ci sono le pages), Infrastructure and test CD, [gestione .env e secrets e branch protection, gestione gitflow(quando merge/rebase)?]
                { text: "Translation tool", link: "/translation-tool" }, //io
                { text: "Conclusion", link: "/conclusion" }
              ]
        }
        ]
    }
})

/*
Il progetto si è posto i seguenti obiettivi di processo, indipendentemente dal dominio applicativo:

| Obiettivo | Pratica adottata |
|---|---|
| Automazione della build | Gradle multi-project per servizi Scala e Node.js |
| Continuous Integration | GitHub Actions: build, test e verifica stile ad ogni push |
| Continuous Delivery | Release semantica automatizzata su ogni merge in `main` |
| Deployment riproducibile | Docker Compose + script centralizzato per tutti gli ambienti |
| Versionamento disciplinato | Conventional Commits + semantic-release + SemVer |
| Qualità del codice | Linting e formattazione verificati su ogni PR |
| Tracciabilità delle release | CHANGELOG generato automaticamente, tag Git per ogni versione |
| Automazione custom | GitHub Action per traduzione i18n senza intervento manuale |
*/

/*

| Area | Tecnologia | Ruolo nel processo |
|---|---|---|
| **Build system** | Gradle (multi-project) | Orchestrazione build e test per tutti i servizi |
| **Containerizzazione** | Docker, Docker Compose | Ambienti riproducibili in locale, CI e produzione |
| **CI/CD** | GitHub Actions | Automazione build, test, release, deploy |
| **Versioning** | semantic-release, Conventional Commits | Release automatizzata basata su commit message |
| **Registry immagini** | GitHub Container Registry (ghcr.io) | Distribuzione immagini Docker per ogni servizio |
| **API Gateway** | Traefik | Routing dichiarativo via Docker labels |
| **Secrets management** | GitHub Secrets + `.env` template | Separazione configurazione da codice |
| **Code quality** | ScalaFmt, ScalaFix, ESLint, Prettier | Verifica automatica stile su ogni PR |
| **Code coverage** | JaCoCo, Istanbul/c8, Codecov | Monitoraggio copertura integrato nella pipeline |
| **Deploy produzione** | SSH + Cloudflare Tunnel | Deploy remoto sicuro senza esporre porte |
| **Documentation** | VitePress + GitHub Pages | Deploy automatico dei report su ogni push |
*/
