# 6 - Test

Il frontend prodotto è stato testato principalmente su Chrome sfruttando i Chrome DevTools per testare la responsività del layout su diversi dispositivi ma anche direttamente da mobile una volta messo online il sito.  Per quanto riguarda il backend sono stati effettuati sia unit test per i singoli componenti sia test e2e principalmente da swagger e in integrazione con il frontend.

### Accessibilità (a11y)

Per garantire l'accessibilità dell'interfaccia sono stati adottati due approcci complementari: **analisi statica** durante lo sviluppo e **test automatizzati** sulle pagine web a runtime.

**Analisi Statica con ESLint**

Il progetto integra **eslint-plugin-vuejs-accessibility** nella configurazione ESLint, identificando potenziali violazioni delle linee guida WCAG direttamente durante lo sviluppo:

```tsx
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'

export default defineConfig([
  // ... altre configurazioni
  ...vuejsAccessibility.configs['flat/recommended'],
])
```

Il plugin verifica automaticamente la presenza di attributi `alt` nelle immagini, la corretta associazione di label ai form e l'uso appropriato di ruoli ARIA. Le violazioni vengono segnalate come warning o errori durante il linting, permettendo di correggere i problemi in fase di sviluppo.

**Test Automatizzati con Puppeteer e Lighthouse**

Oltre all'analisi statica, il sistema implementa test di accessibilità dinamici tramite **Puppeteer** e **Lighthouse**. Lo script `a11y-check-multi.js` esegue audit automatizzati su multiple pagine dell'applicazione:

```tsx
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173/it',
  pages: [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
    { name: 'Create Event', path: '/create-event' },
    { name: 'Event Details', path: '/events/:id' },
  ],
  minScore: parseInt(process.env.MIN_A11Y_SCORE || '80'),
  themeMode: process.env.THEME_MODE || 'both', // 'light', 'dark', 'both'
}
```

Il sistema:

1. **Lancia Chrome in modalità headless** tramite `chrome-launcher`
2. **Connette Puppeteer** per controllare il browser e impostare il tema
3. **Esegue Lighthouse** sulla categoria accessibilità per ogni pagina
4. **Testa entrambi i temi** (light e dark mode) per garantire l'accessibilità in tutte le condizioni
5. **Genera report dettagliati** in formato HTML e un summary testuale

```tsx
async function runLighthouseOnPage(url, port, themeName) {
  const options = {
    logLevel: 'error',
    output: ['json', 'html'],
    onlyCategories: ['accessibility'],
    port: port,
  }
  const runnerResult = await lighthouse(url, options)
  return {
    lhr: runnerResult.lhr,
    reportHtml: runnerResult.report[1],
    theme: themeName,
  }
}
```

Il report generato include:

- **Score di accessibilità** per ogni pagina (scala 0-100)
- **Violazioni critiche** con conteggio degli elementi coinvolti
- **Top 5 problemi più frequenti** nell'intera applicazione
- **Status pass/fail** basato sulla soglia minima configurata (default 80/100)

Per lanciare i test è stato necessario predisporre una modalità ad hoc, eseguibile con `npm run prod:a11y` che prevede login automatico e disabilitazione dell guardie lato frontend così da permettere la corretta visualizzazione di tutte le pagine

Lo script può poi essere eseguito tramite `npm run a11y:multi` e restituisce un exit code non-zero in caso di pagine sotto la soglia minima, permettendo l'integrazione in pipeline CI/CD. 

Al momento, dato che il processo di seed iniziale genera ogni volta id casuali, è necessario ricontrollare i link nella configuazione ad ogni deploy con seeding.

### 5.3.2 Euristiche di Nielsen

Per offrire usabilità e user experience della massima qualità possibile, il sistema è stato sottoposto all'euristica di Nielsen. Di seguito le considerazioni emerse:

1. **Visibilità dello stato del sistema**: per segnalare attività in corso viene mostrata un'icona animata di caricamento. Lo stato online degli utenti è visibile in tempo reale nella chat tramite indicatori colorati, e le notifiche push informano l'utente di nuovi messaggi, like ricevuti o eventi pubblicati dalle organizzazioni seguite.
2. **Corrispondenza tra sistema e mondo reale**: la terminologia e le icone utilizzate sono in linea con le convenzioni dei social network (cuore per i like, fumetto per la chat, campanella per le notifiche). I concetti di "evento", "biglietto" e "organizzatore" rispecchiano il dominio reale della gestione eventi.
3. **Controllo e libertà per l'utente**: l'applicazione non presenta percorsi obbligati. L'utente può navigare liberamente tra le sezioni, tornare indietro in qualsiasi momento, e le operazioni critiche (come l'eliminazione di un evento) richiedono conferma esplicita.
4. **Consistenza e standard**: l'applicazione mantiene un linguaggio visivo uniforme grazie al framework Quasar. I pulsanti primari, secondari e di pericolo hanno stili distintivi e coerenti in tutto il sistema. La palette colori è stata definita in fase di design e applicata uniformemente, inclusa la modalità dark.
5. **Prevenzione dall'errore**: i form implementano validazione in tempo reale (email, password, campi obbligatori) con feedback immediato. Le navigation guards impediscono l'accesso a pagine non autorizzate, reindirizzando automaticamente l'utente (es. alla login se non autenticato).
6. **Riconoscimento più che ricordo**: i layout sono consistenti tra le pagine. La barra di navigazione e i tab mantengono la stessa posizione, le card degli eventi hanno struttura uniforme, e le icone sono autoesplicative senza necessità di tooltip.
7. **Flessibilità ed efficienza**: per gli utenti esperti sono disponibili scorciatoie da tastiera globali tramite il composable `useKeyboardShortcuts`: `Ctrl/Cmd + D` per il toggle del dark mode, `Ctrl/Cmd + H` per tornare alla home, `Ctrl/Cmd + P` per aprire il profilo, e `Ctrl/Cmd + E` per accedere alla creazione eventi.
8. **Estetica e progettazione minimalista**: il design segue il principio KISS con approccio mobile-first. Ogni pagina presenta poche azioni ben distinte: la home mostra gli eventi in evidenza, l'explore permette la ricerca, il profilo gestisce le informazioni personali.
9. **Aiuto nel riconoscimento e recupero dagli errori**: i messaggi di errore sono contestuali e descrittivi. Le notifiche toast informano l'utente dell'esito delle operazioni, e i campi dei form mostrano label di errore specifiche (es. "Email non valida", "Password troppo corta").
10. **Documentazione**: vista la semplicità d'uso derivante dalle scelte di design, non è stata necessaria documentazione esterna. Il sistema guida l'utente attraverso placeholder nei campi, stati vuoti informativi e feedback contestuali. Le scorciatoie da tastiera disponibili (`Ctrl/Cmd + D/H/P/E`) sono documentate internamente nel composable `useKeyboardShortcuts`, pronte per essere esposte in una futura sezione "Keyboard Shortcuts" nelle impostazioni.

### 5.3.3 Test di Usabilità

Uno stretto campione di utenti si è prestato alla verifica dell'utilizzo del sistema, fornendo feedback iterativamente così da poter decidere quali aspetti assumere come definitivi e quali rielaborare. Ai soggetti del test non è stata fornita nessuna linea guida, limitandosi a fornire la singola richiesta, al fine di osservare come gli utenti avrebbero cercato di eseguire i compiti richiesti vedendo per la prima volta il sistema.

**Test per Organizzazioni**: fra i compiti assegnati hanno figurato la creazione di eventi mediante l'apposito editor, che si è rivelato semplice ed intuitivo. È stato richiesto di gestire i propri eventi, modificare il profilo e interagire con il sistema di ticketing.

**Test per Membri**: fra i compiti figurava la navigazione degli eventi, commentare e votare quelli di interesse, iscriversi agli eventi, e aggiornare il proprio profilo con elementi fra cui interessi e preferenze. Gli utenti sono stati interrogati sulla chiarezza degli indicatori per consultare i propri ticket e interagire con la chat.

In generale gli utenti hanno trovato la disposizione dei vari elementi sempre adeguata. Le osservazioni sollevate erano perlopiù su aspetti stilistici e sono state incorporate nelle successive iterazioni di sviluppo.