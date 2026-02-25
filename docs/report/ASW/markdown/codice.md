# 5 - Codice

L'architettura del progetto **EvenToNight** si basa su una **Single Page Application (SPA)** per il frontend e un layer di **microservizi backend** esposti attraverso **Traefik** come reverse-proxy/API gateway.

## 5.1 - Frontend

Il frontend è stato sviluppato con **Vue 3** utilizzando la **Composition API** e **TypeScript**, sfruttando il framework **Quasar** per i componenti UI.

L'applicazione fa uso delle principali funzionalità di Vue come `provide/inject`, `props/emit`, `defineModel`, `defineExpose`, `watchers` e in alcune situazioni la direttiva `:key` per innescare il refresh dei componenti.

### Struttura del Progetto

```markdown
/src/
├── api/                 # Layer di astrazione API con supporto mock
│   ├── adapters/        # Adapter per allinare i dati ricevuti dalle API
│   ├── mock-services/   # Implementazioni mock per sviluppo
│   ├── services/        # Implementazioni API dei servizi
│   └── client.ts        # Client HTTP con gestione JWT
├── components/          # Componenti Vue riutilizzabili
├── composables/         # Funzionalità riutilizzabili dai vari componenti
├── i18n/                # File di lingua
├── layouts/             # Layout condivisi
├── router/              # Configurazione routing e guards
├── stores/              # Pinia store
└── views/               # Pagine dell'applicazione

```

### Gestione dello Stato con Pinia

Lo store Pinia gestisce l'autenticazione dell'utente e i token JWT. Il sistema implementa il refresh automatico dei token prima della scadenza:

```typescript
interface Tokens {
  accesToken: AccessToken,
  refreshToken: RefreshToken,
  refreshExpiresAt: number,
}

export const useAuthStore = defineStore('auth', () => {
  const user = ref<User | null>(null)
  const tokens = ref<Tokens | null> (null)

  const isAuthenticated = computed(() => {
    if (!tokens.value || !user.value) return false
    return tokens.value.refreshExpiresAt > Date.now()
  })

  // Set data to local storage to avoid data loss on page refresh
  const setAuthData = async (authData: LoginResponse) => {
    setTokens(authData)
    setUser(authData.user)
    setupAutoRefresh()
    await api.notifications.connect(authData.user.id, authData.accessToken) //Connect to Socket
  }

  // Restores auth data from session storage (if any)
  const refreshCurrentSessionUserData = () => {}

  // Auto-refresh 5 minutes before expiration
  const setupAutoRefresh = () => {
    const refreshTime = tokens.value.refreshExpiresAt - Date.now() - 5 * 60 * 1000
    if (refreshTime > 0) {
      setTimeout(() => refreshAccessToken(), refreshTime)
    }
  }
})
```

### Layer API e Mocking Strategy

Un aspetto fondamentale dello sviluppo è stato il **layer di astrazione API**, che ha permesso di prototipare il frontend indipendentemente dalla disponibilità dei microservizi backend.

Il sistema utilizza una variabile d'ambiente per utilizzare API reali o mock:

```typescript
const useRealApi: boolean = import.meta.env.VITE_USE_MOCK_API === 'false'

export const api = {
  events: useRealApi ? createEventsApi(createEventsClient()) : mockEventsApi,
  chat: useRealApi ? createChatApi(createChatClient()) : mockChatApi,
  notifications: useRealApi
    ? createNotificationsApi(createNotificationsClient())
    : mockNotificationsApi,
  // other services
}
```

Il client HTTP gestisce centralmente l'injection del token JWT e il refresh automatico in caso di 401:

```typescript
const token = tokenProvider?.()
if (token) {
  headers['Authorization'] = `Bearer ${token}`
}

// Refresh after receiving 401
if (response.status === 401 && !isRetry && onTokenExpired) {
  const refreshed = await onTokenExpired()
  if (refreshed) {
    return this.request(endpoint, options, true)
  }
}
```

Questo approccio, seguendo il principio **Dependency Inversion (DIP)**, ha permesso di sviluppare componenti UI indipendenti dall'implementazione concreta delle API e ha facilitato il testing.

### Router e Navigation Guards

Il sistema di routing utilizza due livelli: un livello root per gestire redirect e rotte speciali, e un livello nested sotto `/:locale` per tutte le rotte localizzate. Questa separazione è stata necessaria perché alcune rotte (come quella codificata nel QR code nei biglietti) non richiedono il prefisso della lingua.

```typescript

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: () => `/${getInitialLocale()}`,
    },
    {
      path: '/verify/:ticketId',
      redirect: (to) => `/${getInitialLocale()}/verify/${to.params.ticketId}`,
    },
    {
      path: '/:locale',
      component: LocaleWrapper,
      children: [
        { path: '', name: 'home', component: Home },
        { path: 'login', name: 'login', component: () => import('../views/AuthView.vue'), beforeEnter: requireGuest },
        { path: 'events/:id', name: 'event-details', component: () => import('../views/EventDetailsView.vue'), beforeEnter: requireNotDraft },
        { path: 'create-event', name: 'create-event', component: () => import('../views/CreateEventView.vue'), beforeEnter: requireRole('organization') },
        // ... other routes
      ],
    },
  ],
})

// Global guard for i18n synchronization
router.beforeEach((to, _from, next) => {
  const locale = to.params.locale as string

  // Redirect if locale is not supported
  if (locale && !SUPPORTED_LOCALES.includes(locale)) {
    return next(`/${DEFAULT_LOCALE}${to.path.substring(locale.length + 1)}`)
  }

  // Restore saved locale preference on navigation
  const savedLocale = localStorage.getItem('user-locale')
  if (savedLocale && locale && locale !== savedLocale && SUPPORTED_LOCALES.includes(savedLocale)) {
    return next({
      name: to.name as string,
      params: { ...to.params, locale: savedLocale },
      query: to.query,
      replace: true,
    })
  }

  // Sync i18n with URL locale
  if (locale && i18n.global.locale.value !== locale) {
    i18n.global.locale.value = locale as Locale
    localStorage.setItem('user-locale', locale)
  }

  next()
})
```

Le **navigation guards** proteggono le rotte in base all'autenticazione e ai ruoli:

```typescript
export const requireAuth = (to, _from, next) => {
  const authStore = useAuthStore()
  if (!authStore.isAuthenticated) {
    next({ name: LOGIN_ROUTE_NAME, query: { redirect: to.fullPath } })
  } else {
    next()
  }
}

export const requireRole = (role: string) => {
  return (to, from, next) => {
    const authStore = useAuthStore()
    if (authStore.user?.role !== role) {
      next({ name: FORBIDDEN_ROUTE_NAME })
    } else {
      next()
    }
  }
}
```

Le guards guidano l'utente nell'utilizzo dell'applicazione, impedendo l'accesso a pagine non autorizzate e reindirizzandolo automaticamente (ad esempio, se un organizzazione vuole creare un evento ma non ha effettuato l'accesso, prima si ha un redirect alla pagina di login).

### Comunicazione Real-time con WebSocket

La comunicazione in tempo reale è gestita tramite [**Socket.IO**](http://socket.io/) per le notifiche e i messaggi chat:

```typescript
socket = io(url, {
  auth: { token, userId },
  reconnection: true,
  reconnectionAttempts: 5,
  transports: ['websocket', 'polling'],
})

socket.on('connect', () => {
  handlers.forEach(({ handler, eventType }) => {
    socket?.on(eventType, handler)
  })
})
```

Gli eventi gestiti includono:

- `user-online` / `user-offline` - Stato online degli utenti
- `new-message` - Nuovi messaggi in chat
- `like-received` / `follow-received` - Notifiche di interazione
- `new-event-published` - Nuovi eventi pubblicati da utenti seguiti

### Composables Riutilizzabili

I composables incapsulano logiche riutilizzabili tra i componenti. Un esempio significativo è `useInfiniteScroll` per la paginazione:

```typescript
export function useInfiniteScroll<R>(config: InfiniteScrollConfiguration<R>) {
  const items: Ref<R[]> = ref([])
  const hasMore = ref(true)
  const loading = ref(true)

  const onLoad = async (_index: number, done: (stop?: boolean) => void) => {
    if (!hasMore.value) {
      done(true)
      return
    }
    await loadItems(true)
    done(!hasMore.value)
  }

  return { items, hasMore, loading, onLoad, reload }
}
```

Altri composables includono:

- `useUserProfile` - Logica profilo utente (isOwnProfile, isOrganization)
- `useDarkMode` - Gestione tema chiaro/scuro con persistenza
- `useTranslation` - Traduzioni con prefisso automatico

### Layout Condivisi

Sono stati definiti anche layout riutilizzabili per garantire consistenza nell'interfaccia:

- **NavigationWithSearch**: Utilizzato in home ed explore, serve a gestire la comparsa della barra di ricerca nella barra di navigazione dal momento che esce dalla viewport e viceversa.
- **TwoColumnLayout**: Utilizzato in chat e impostazioni, con supporto mobile che mostra una colonna alla volta

### Internazionalizzazione (i18n)

L'applicazione supporta 5 lingue (en, es, fr, it, de). Le traduzioni sono generate automaticamente in CI a partire dal sorgente inglese:

```typescript
const localeModules = import.meta.glob('./locales/*.ts', { eager: true })

const i18n = createI18n({
  legacy: false,
  locale: DEFAULT_LOCALE,
  fallbackLocale: DEFAULT_LOCALE,
  messages,
})
```

L'utilizzo nei componenti avviene tramite il composable useTranslation:

```typescript

const { t } = useTranslation('components.cards.EventCard')

```

Inoltre il selettore delle lingue nelle impostazioni del profilo utilizza l'API nativa `Intl.DisplayNames` per mostrare ogni lingua nel proprio nome nativo (es. "Italiano", "Français", "Deutsch"), migliorando l'accessibilità per gli utenti:

```typescript
const getLanguageInfo = (code: string): LanguageOption => {
  const nativeNames = new Intl.DisplayNames([code], { type: 'language' })
  return {
    code,
    nativeName: nativeNames.of(code) || code.toUpperCase(),
    flag: getFlagEmoji(code),
  }
}
```

L'internazionalizzazione si estende anche al backend: il servizio Payments genera i **biglietti PDF nella lingua dell'utente**, con traduzioni dedicate.

Il backend predispone inoltre la gestione dei prezzi con le valute e un sistema di conversione con caching, attualmente non utilizzato dal frontend ma pronto per future estensioni:

```typescript
export class CurrencyConverter {
  private static readonly CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

  static async convertAmount(amount: number, fromCurrency: string, toCurrency: string): Promise<number> {
    const fromRates = await this.fetchRatesForCurrency(from)
    return this.converter.convert(amount, from, to, fromRates)
  }
}
```

**Limiti attuali**: I contenuti user-generated come le descrizioni degli eventi non sono attualmente tradotti e vengono memorizzati nella lingua in cui sono stati inseriti dall'organizzazione. Un'estensione futura potrebbe prevedere la possibilità di inserire descrizioni in più lingue, con fallback alla lingua originale quando la traduzione non è disponibile.

### Geolocalizzazione degli eventi

Per l'inserimento della posizione durante la creazione di un evento è stata utilizzata l'API pubblica di **Nominatim** (OpenStreetMap) per la ricerca e il geocoding degli indirizzi. La scelta di OpenStreetMap è stata dettata dalla sua natura open-source e dall'assenza di costi di utilizzo.

Poiché la maggior parte degli utenti utilizza Google Maps per la navigazione, i dati ricevuti da Nominatim vengono elaborati per generare link compatibili con Google Maps, permettendo all'utente di cliccare sulla posizione dell'evento e aprirla direttamente nell'applicazione di navigazione.

```typescript
export const extractLocationMapsLink = (location: LocationData): string => {
  const query = `${location.name},${location.road},${location.city},${location.country}`
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`
}
```

## **5.2 Backend**

Il backend è composto da **7 microservizi**: 2 sviluppati in **Scala 3** con il framework **Cask** (Users ed Events), 3 in **NestJS** (Interactions, Chat e Payments) e 2 in **Express.js** (Notifications e Media).

Ogni servizio ha la propria istanza **MongoDB** dedicata e comunica con gli altri tramite **RabbitMQ** con topic exchange. Il servizio Notifications gestisce le connessioni WebSocket tramite **Socket.IO** per le notifiche real-time e il tracciamento dello stato online degli utenti.

### Struttura del Progetto

Essendo i microservizi eterogenei segue una descrizione di massima rappresentativa della struttura delle varie implementazioni, viene usata la terminologia dello stack MEVN ma alcuni componenti potrebbero avere un nome/implementazione diversa (e.i. in Nest il concetto di router e controller viene unito in un unico componente rispetto ad express).

```markdown
/src/
├── presentation/        # Layer di ingresso al servizio
├── application/         # Layer contenenti le logiche applicative
├── domain/              # Modello dei dati
└── infrastructure/      # Dipendenze del dominio
```

Più nel dettaglio, nel primo layer di presentazione troviamo i router che definiscono le rotte (path + metodo http) supportate da ciascun servizio. In application sono specificati i diversi DTO usati per validare i dati in ingresso agli endpoint e strutturare i dati di risposta degli stessi e i controller delle varie rotte. Nel dominio sono definiti i modelli delle entità di interesse per il particolare servizio e in infrastructure troviamo le varie dipendenze esterne, tipicamente le implementazioni dei connectors a database e message-broker

### Autenticazione JWT

L'autenticazione è basata su **JWT**. Il servizio Users integra **Keycloak** come identity provider per la gestione delle credenziali utente (registrazione, login, gestione delle sessioni). Keycloak genera i token JWT firmati e il servizio Users espone un endpoint `/public-keys` che restituisce le chiavi pubbliche necessarie per la validazione.

Gli altri microservizi recuperano le chiavi pubbliche da questo endpoint e le salvano in cache localmente. Quando ricevono una richiesta autenticata, estraggono il token dall'header `Authorization`, ne verificano la firma e decodificano i claim.

Oltre alle REST API, l'autenticazione è stata implementata anche per le connessioni WebSocket: il token viene passato durante l'handshake della connessione Socket.IO e validato prima di stabilire il canale. Questo permette di inviare notifiche con dati (oltre che solo segnali) in modo sicuro.

### Express Middlewares

Per gestire le richieste HTTP in **Express** sono stati utilizzati i middleware, in particolare è stato definito un middleware per l’autenticazione:

```typescript
export function createAuthMiddleware(options: { optional?: boolean } = {}) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.replace("Bearer ", "")

    if (!token) {
      if (options.optional) return next()
      return res.status(401).json({ error: "No token provided" })
    }

    try {
      const payload = await JwtService.verifyToken(token)
      req.userId = payload.user_id
      next()
    } catch (error) {
      res.status(401).json({ error: "Authentication failed" })
    }
  }
}

export const authMiddleware = createAuthMiddleware()
export const optionalAuthMiddleware = createAuthMiddleware({ optional: true })
```

Le routes utilizzano poi questo middleware per proteggere gli endpoint:

```typescript
export function createNotificationRoutes(controller: NotificationController): Router {
  const router = Router()
  router.use(authMiddleware)

  router.get("/", (req, res, next) =>
    controller.getNotificationsByUserId(req, res, next))
  router.get("/unread-count", (req, res, next) =>
    controller.getUnreadCount(req, res, next))
    //other routes...
 
  return router
}
```

A livello applicativo vengono inoltre utilizzati i middleware standard di Express: `cors()` per gestire le richieste cross-origin (necessario per le chiamate dal frontend) e `express.json()` per il parsing automatico del body JSON.

### Authenticated WebSocket Gateway con Socket.IO

Il gateway **Socket.IO** gestisce l'autenticazione delle connessioni WebSocket e la distribuzione delle notifiche:

```typescript
export class SocketIOGateway implements NotificationGateway {
  private userSockets: Map<string, Set<string>> = new Map()

  private setupAuthMiddleware(): void {
    this.io.use(async (socket: Socket, next) => {
      const token = socket.handshake.auth.token ||
                    socket.handshake.headers.authorization?.replace("Bearer ", "")

      if (!token) {
        return next(new Error("Authentication error: No token provided"))
      }

      try {
        const payload = await JwtService.verifyToken(token)
        socket.data.userId = payload.user_id
        next()
      } catch (err) {
        next(new Error("Authentication error: Invalid token"))
      }
    })
  }

  sendNotificationToUser(userId: string, notification: any): Promise<void> {
    const topic = this.getTopicFromNotificationType(notification.type)
    this.io.to(`user:${userId}`).emit(topic, notification)
    return Promise.resolve()
  }

  broadcastUserOnline(userId: string): void {
    this.io.except(`user:${userId}`).emit("user-online", {
      userId,
      timestamp: new Date()
    })
  }

  broadcastUserOffline(userId: string): void {
    this.io.emit("user-offline", {
      userId,
      timestamp: new Date()
    })
  }
}
```

### Endpoint con autenticazione opzionale

Alcuni endpoint utilizzano l'**autenticazione opzionale**: sono accessibili sia da utenti autenticati che non, in questo caso la risposta può variare pur mantenendo il formato consistente. Ad esempio, l'endpoint per ottenere il profilo di un utente restituisce solo i dati pubblici (username e informazioni del profilo) se la richiesta non è autenticata, mentre include anche i dati privati dell'account (e.g. email, interessi) se l'utente autenticato sta richiedendo le proprie informazioni:

```scala
@cask.get("/:userId")
  def getUser(userId: String, req: Request): Response[String] =
    userService.getUserById(userId) match
      case Left(err) => Response(err, 404)
      case Right(role, user) =>
        val isOwner: Boolean = authenticateAndAuthorize(req, userId).isRight
        val json = if isOwner then
            user.toOwnedUserDTO(userId, role).asJson
        else
          user.toUserDTO(userId, role).asJson
        Response(json.spaces2, 200, Seq("Content-Type" -> "application/json"))
```