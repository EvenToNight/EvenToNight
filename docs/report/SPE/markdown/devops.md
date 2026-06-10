# 3 - DevOps

## 3.1 - Build Automation

### Gradle as a Multi-language orchestratior

Come sistema di build principale è stato utilizzato gradle, nella root del progetto sono presenti il file build.gradle.kts principale che definisce task generici del progetto e il file settings.gradle dove sono configurati i git hooks e registrati i diversi subprojects. Nel caso in cui i subproject siano jvm based (events e users) anche nei subproject è utilizzato gradle, in caso di servizi js/ts è utilizzato gradle ma con riferimento al build sistem npm utilizzando il plugin node per gradle.

é stato preferito questo setup a monorepo per semplificare la gestione del codice di progetto ecc.. trova motivazioni vere per cui è comodo.

### Convention plugins e task personalizzati

nella cartella buildSrc sono stati definiti due convention plugin per semplificare la definizione dei suproject e evitare la duplicazione di codice. oltre a questi è stato definito un task custom per semplificare l'esecuzione di arbitrary shell commands, sequential chaining and with success/failure callbacks, Cross-platform support is handled inside.

qua sono definite anche delle utiliti con costanti per colori e docker commands.

### Git hooks

hooks are installed using a plugin in settings.gradle, in particolare sono configurati due pre-commit:
-formatAndLintPreCommit: che lancia il task format and lint, che deve essere correttamente configurato in ogni subproject e poi riaggiunge in staged tutti i file presenti al momento del commit così da includere le eventuali modifiche di stile.
-updateAndCheckEnvSetup: aggiorna il file .env sulla base del file .env.template aggiungendo eventuali variabili mancanti e controlla che entrambi i file contengano le stesse e che in caso di .env siano popolate. in questo caso è utilizzato per prevenire il push di variabili aggiunte solo in .env

e un commit-msg hook che controlla che il messaggio di commit rispetti le conventionalCommits convention.

---
## 3.2 - Dockerization

### Dockerfile design

Every service has its own `Dockerfile`. The design follows consistent principles shaped by two goals: **layer caching** and **minimazing image size**. this is achieved by properly order the instruction and by dividing the image creation in two-stage, one for building and the other to maintain only the relevant files.

### Docker Compose layer system

Compose files are defined for every service and infrastructure component, in the project are not standalone — they are rilevati e **merged in layers** by utility scripts. la confiration is the following:

-base file 
-compose file
-dev compose
-swarm compose
(in tutti spiega cosa ci sta)
l'idea è che alla base ci sta il base file, poi per un deploy normale viene unito il compose file, per un deploy dev viene unito anche il dev.

nel caso del deploy swarm (beta) al di sopra del base file viene unito lo swarm

---
## 3.3 - DVCS

### Git Flow

il repo e la strategia di branching/merge è stata gestita seguendo git flow, quindi c'è un unico brach principale 'main' su cui exlusively through a **pull request**. 

la strategia di merge dipende dai cambiamenti presenti nella pr, in caso di piccole modifiche di cui il tracciamento non è significativo si è optati per un rebase di modo da tenere la hystori piu lineare, **merge commits** are used for larger feature branches to preserve the branch topology and keep the work unit traceable as a unit in the graph.

### Branch Protection

Per il branch main sono state definite delle regole per gestirne l'utilizzo, in particolare:

le modifiche su main devono essere fatte tramite pr almeno revisionate/approvate da un altro membro del team

workflow ci devono passare (elenca quali workflow)

il push su main è bloccato, l'unica entità withelistata è una github app creata per generare un token da associare al workflow di release cosi da renedere possibile il push dei changelog.

in pull request for main are also enabled automatic copilot review (aggiungi un micro perche possono essere utili)

### Environment and Secret

The `.env.template` file acts as the authoritative schema for the environment, in case of configuration variable a default value is placed, in case of api-key and passwords no value is placed, so in that way check env task 1.ti obbliga a mettere delle password evitando il rischio di usare i placeholder
2. will fail if some value are missing, to allow building and testing in ci, default value for password are inserted.

Environment variable and secrets required in workflows are stored
as **GitHub Actions Variables/Secrets**
## 3.4 - CI/CD Pipelines

### Quality gates on pull requests

Three quality workflows fire on every pull request on main:

**`build-and-test.yml`** runs build test and push coverage report and after detected which dockerifile are changed check that that docker images builds validating that the image builds cleanly before the code lands.

**`check-style.yml`** runs `./gradlew checkStyle` to verify linting and formatting

**`check-commit-convention.yml`** runs a dedicated action that inspects every commit in the PR and validates it against the Conventional Commits specification. 

both check style and commit convention are present as hooks but they are double checked in ci since hooks can be bypassed.

### Translation check

è definito un **`auto-i18n.yml`** workflow che è eseguito triggers on pushes to the frontend feature branch (`feature/frontend-service`) and on every pull request. on push it evaluates if the transaltion are present and in caso fa commit con le traduzioni, nelle pr fa solo check. per evitare di fare partire i check anche nel commit è usato il [skip ci], però se c'è gia una pr aperta da quel branch viene omesso cosi da far passare tutti i check required.

### Github Pages

**`deploy-pages.yml`** triggers on pushes to `main` and any `docs/*` branch. It builds all three VitePress report sites (ASW, DS, SPE), copies static assets, OpenAPI and AsyncAPI specs into the output tree, and publishes everything to **GitHub Pages**.

### Release and Deploy

Every merge to `main` triggers `release.yml` pipeline. Come prima cosa viene valutata e generata una release, le versioni seguono semantic versioning, se ci sono modifiche sotto infratsctucture e service e non è stata generata nessuna nuova versione è generata incrementalmente una dev pre-release. 

in caso venga generato un nuovo tag allora si procede andando a cercare le Find all modified directories with Dockerfiles per poi successivamente build-and-push-docker-images su ghcr.io, le imagini sono buioldare multiarch (scrivi meglio) The service name is derived from the Dockerfile path: `services/chat/Dockerfile` → `chat`

[metti immagine public/devops/deployed-infrastructure.png]

Considerando che l'infrastruttura usata è questa viene fatto login ssh passando per cloudflare SSHs into the production server through a **Cloudflare Tunnel**. the tunnel authenticates via Cloudflare Access and the action bridges the connection through Cloudflare's network

after login the repo is pulled on remote machine, the new docker images are pulled and 
deployed


il deploy swarm è ancora in beta `scripts/swarmDeploy.sh` manages the full Docker Swarm lifecycle, including images deploy to docker hub to make it available to all swarm nodes. 







