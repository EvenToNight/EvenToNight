# 2 - Requisiti

Di seguito sono riportati i principali requisiti che l’applicazione deve soddisfare. 

### 2.1 - Requisiti di Business

- La piattaforma consente alle organizzazioni di creare e pubblicare post relativi agli eventi da loro promossi.
- Gli utenti possono utilizzare la piattaforma come punto di riferimento per scoprire eventi nelle vicinanze, in base alla località e ai propri interessi.
- Il sistema abilita la vendita online dei biglietti degli eventi fornendo alle organizzazioni uno strumento per monetizzare le proprie attività.


### 2.2 - Requisiti Funzionali

**Tipologie di utenti supportate dal sistema:**

- Utenti non registrati.
- Utenti registrati, che possono fruire dei contenuti della piattaforma.
- Utenti registrati come organizzazioni, che possono creare eventi, vendere biglietti e fruire dei contenuti della piattaforma.

**Per tutti gli utenti:**

- Visualizzare la schermata Home con le modalità di interazione: ricerca eventi, visualizzazione eventi popolari, prossimi eventi e nuove aggiunte.
- Visualizzare dalla schermata Esplora tutti gli eventi pubblicati sulla piattaforma, tutti gli utenti registrati e applicare filtri di ricerca.

**Per utenti registrati:**

- Ricevere un feed di eventi personalizzato, basato sugli interessi specificati.
- Mettere e togliere like a un evento.
- Mettere e togliere follow a un membro e a un’organizzazione.
- Acquistare biglietti per gli eventi.
- Lasciare una recensione dopo la partecipazione a un evento.
- Contattare direttamente le organizzazioni all’interno della piattaforma per richiedere supporto.
- Ricevere notifiche su:
    - nuovo follower.
    - pubblicazione di nuovo evento da parte di organizzazione seguita.
    - nuovo messaggio.

**Per utenti registrati come organizzazioni:**

- Creare eventi, scegliendo se renderli pubblici o salvarli come bozza.
- Specificare collaboratori durante la creazione degli eventi.
- Ricevere notifiche su like e recensioni ai propri eventi.

### 2.3 - Requisiti Non Funzionali

- Accessibilità: l'interfaccia grafica deve essere accessibile.
- Portabilità: l'applicazione risulta responsive per adattarsi a schermi di diverse dimensioni pc/tablet/mobile.
- Deployability: il sistema in automatico deve aggiornarsi alla versione dell’ultima release.
- Availability: il sistema deve essere tollerante ai guasti per garantire la disponibilità, deve poter effettuare un recupero automatico in caso di errore e prevedere la ridondanza dei componenti critici per assicurare la continuità del servizio.
- Sicurezza: gli utenti del sistema devono autenticarsi per verificare la loro identità e saranno poi autorizzati ad accedere alle risorse in base alle regole definite. Inoltre per assicurare la confidenzialità delle password queste saranno salvate in modo cifrato.
- Robustezza: l'applicazione deve gestire input errati e generare errori coerenti.
- Affidabilità: l'applicazione deve essere stabile, evitando crash.
- Manutenibilità: il codice deve essere ben strutturato e ben documentato.
- Estendibilità: il progetto deve favorire la personalizzazione e l'aggiunta di funzionalità.

Inoltre si è scelto, anche per esigenze didattiche, di aggiungere come requisito architetturale lo sviluppo del sistema con un’architettura a microservizi.
