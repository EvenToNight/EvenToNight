# 6 - Test

Il frontend prodotto è stato testato principalmente su Chrome sfruttando i Chrome DevTools per testare la responsività del layout su diversi dispositivi ma anche direttamente da mobile una volta messo online il sito.  Per quanto riguarda il backend sono stati effettuati sia unit test per i singoli componenti sia test e2e principalmente da Swagger e in integrazione con il frontend.

## 6.1 - Accessibilità (a11y)

Per garantire l'accessibilità dell'interfaccia sono stati adottati due approcci complementari: **analisi statica** durante lo sviluppo e **test automatizzati** sulle pagine web a runtime.

### Analisi Statica con ESLint

Il progetto integra **eslint-plugin-vuejs-accessibility** nella configurazione ESLint, identificando potenziali violazioni delle linee guida WCAG direttamente durante lo sviluppo:

```tsx
import vuejsAccessibility from 'eslint-plugin-vuejs-accessibility'

export default defineConfig([
  // ... altre configurazioni
  ...vuejsAccessibility.configs['flat/recommended'],
])
```

Il plugin verifica automaticamente la presenza di attributi `alt` nelle immagini, la corretta associazione di label ai form e l'uso appropriato di ruoli `ARIA` segnalando le violazioni come warning o errori durante il linting.

### Test Automatizzati con Puppeteer e Lighthouse

Oltre all'analisi statica, il sistema implementa test di accessibilità dinamici tramite **Puppeteer** e **Lighthouse**. Lo script `a11y-check-multi.js` esegue un audit automatizzato sulle pagine specificate in fase di configurazione:

```tsx
const config = {
  baseUrl: process.env.BASE_URL || 'http://localhost:5173/it',
  pages: [
    { name: 'Home', path: '/' },
    { name: 'Explore', path: '/explore' },
    { name: 'Login', path: '/login' },
    { name: 'Register', path: '/register' },
    { name: 'Create Event', path: '/create-event' },
    { name: 'Event Details', path: '/events/547a3b27-344a-4318-b17e-edf7cd14aee3' },
    {
      name: 'Organization Profile [Published Events Tab]',
      path: '/users/7dee946f-3ab9-41b5-92e9-ea6264d9dd35#publishedEvents',
    },
  ],
  minScore: parseInt(process.env.MIN_A11Y_SCORE || '80'),
  themeMode: process.env.THEME_MODE || 'both', // 'light', 'dark', 'both'
}
```

Lo script:

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


<div align="center" style="display: flex; justify-content: center; gap: 10px;">
  <img src="/test/a11y-report-summary.png" alt="Report di accessibilità eseguito con Lighthouse" width="85%" />
</div>


Per lanciare i test è stato necessario predisporre una modalità ad hoc, eseguibile con `npm run prod:a11y` che prevede login automatico come organizzazione e disabilita le guardie lato frontend così da permettere la corretta visualizzazione di tutte le pagine.

Lo script può poi essere eseguito tramite `npm run a11y:multi` e restituisce un exit code non-zero in caso di pagine sotto la soglia minima, permettendo l'integrazione in pipeline CI/CD. 

Al momento, dato che il processo di seed iniziale genera ogni volta id casuali, è necessario ricontrollare i link nella configuazione ad ogni deploy con seeding.

## 6.2 - Euristiche di Nielsen

Per offrire una migliore usabilità e user experience, il sistema è stato sottoposto alla valutazione delle euristiche di Nielsen. Di seguito le considerazioni emerse:

1. **Visibilità dello stato del sistema**: per segnalare attività in corso viene mostrata un'icona animata di caricamento. Lo stato online degli utenti è visibile in tempo reale nella chat tramite un apposito label, e le notifiche push informano l'utente di nuovi messaggi, like ricevuti o eventi pubblicati dalle organizzazioni seguite.
2. **Corrispondenza tra sistema e mondo reale**: la terminologia e le icone utilizzate sono in linea con le convenzioni dei social network (cuore per i like, fumetto per la chat, campanella per le notifiche). I concetti di "evento", "biglietto" e "organizzazione" rispecchiano il dominio reale.
3. **Controllo e libertà per l'utente**: l'applicazione non presenta percorsi obbligati. L'utente può navigare liberamente tra le sezioni, tornare indietro in qualsiasi momento e le operazioni critiche (come l'eliminazione di un evento) richiedono conferma esplicita.
4. **Consistenza e standard**: l'applicazione mantiene un linguaggio visivo uniforme grazie al framework Quasar. I pulsanti primari, secondari e di pericolo hanno stili distintivi e coerenti in tutto il sistema. La palette colori è stata definita in fase di design e applicata uniformemente, inclusa la modalità dark.
5. **Prevenzione dall'errore**: i form implementano validazione in tempo reale (formato di email, password e campi obbligatori in generale) con feedback immediato. Le navigation guards impediscono l'accesso a pagine non autorizzate, reindirizzando automaticamente l'utente (es. alla pagina di login se necessaria autenticazione).
6. **Riconoscimento anziché ricordo**: i layout sono consistenti tra le pagine. La barra di navigazione e i tab mantengono la stessa posizione, le card degli eventi hanno struttura uniforme e le icone sono autoesplicative senza necessità di tooltip.
7. **Flessibilità ed efficienza d'uso**: per gli utenti esperti sono disponibili scorciatoie da tastiera globali: `Ctrl/Cmd + D` per il toggle della dark mode, `Ctrl/Cmd + H` per tornare alla home, `Ctrl/Cmd + P` per aprire il profilo e `Ctrl/Cmd + E` per accedere alla creazione eventi.
8. **Design e estetica minimalista**: il design segue il principio KISS con approccio mobile-first. Ogni pagina presenta poche azioni ben distinte: la home mostra gli eventi in evidenza, la pagina explore permette la ricerca, il profilo gestisce le informazioni personali.
9. **Aiuto all'utente**: i messaggi di errore sono contestuali e descrittivi. Le notifiche toast informano l'utente dell'esito delle operazioni e i campi dei form mostrano label di errore specifiche (e.g. "Email non valida", "Password troppo corta").
10. **Documentazione**: vista la semplicità d'uso derivante dalle scelte di design, non è stata necessaria documentazione esterna. Le scorciatoie da tastiera disponibili (`Ctrl/Cmd + D/H/P/E`) sono documentate internamente nel composable `useKeyboardShortcuts`, pronte per essere esposte in una futura sezione "Keyboard Shortcuts" nelle impostazioni.

## 6.3 - Test di Usabilità

Durante lo sviluppo dell'applicazione, questa è stata fatta provare a diversi utenti, per ricevere di volta in volta dei feedback utili a migliorare lo sviluppo e la resa finale del prodotto.

 Ai soggetti del test non è stata fornita nessuna linea guida, ci si è limitati a richiedere una particolare azione da svolgere al fine di osservare come gli utenti avrebbero cercato di eseguire i compiti richiesti vedendo per la prima volta il sistema.

**Test per Organizzazioni**: fra i compiti assegnati hanno figurato la creazione di eventi mediante l'apposito editor, che si è rivelato semplice ed intuitivo.

**Test per Membri**: fra i compiti figurava la ricerca degli eventi, l'acquisto dei biglietti, la modifica del profilo e di effettuare una recensione per un evento.

In generale gli utenti hanno trovato la disposizione dei vari elementi sostanzialmente adeguata. Le osservazioni sollevate erano perlopiù su aspetti stilistici e sono state incorporate nelle successive iterazioni di sviluppo.