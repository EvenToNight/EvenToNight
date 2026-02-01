export default {
  meta: {
    description:
      "Trova l'evento che fa per te. Cerca i prossimi eventi e scopri esperienze straordinarie.",
    keywords: 'eventi, movida, concerti, feste, eventi notturni',
  },

  defaults: {
    searchHint: 'Cerca eventi, organizzazioni o utenti...',
  },

  views: {
    AboutView: {
      title: 'Chi siamo',
      firstSectionTitle: 'La nostra missione',
      firstSectionContent:
        "EvenToNight nasce con l'obiettivo di connettere le persone attraverso esperienze uniche. Crediamo che ogni evento sia un'opportunità per creare ricordi indimenticabili e costruire comunità.",
      secondSectionTitle: 'La nostra storia',
      secondSectionContent:
        'Fondata nel 2025, EvenToNight è cresciuta rapidamente fino a diventare la piattaforma di riferimento per scoprire e gestire eventi. Fin dal primo giorno, abbiamo lavorato per rendere l’organizzazione e la partecipazione agli eventi semplice e accessibile a tutti.',
      thirdSectionTitle: 'I nostri valori',
      thirdSectionItems: {
        item1: 'Trasparenza nelle comunicazioni e nelle transazioni',
        item2: 'La comunità al centro di tutto ciò che facciamo',
        item3: "Innovazione continua per migliorare l'esperienza dell'utente",
      },
    },
    CreateEventView: {
      title: {
        new: 'Crea nuovo evento',
        edit: 'Modifica evento',
      },
      form: {
        title: {
          label: "Titolo dell'evento",
          error: 'Il titolo è obbligatorio',
        },
        date: {
          label: 'Data',
          error: 'La data è obbligatoria',
        },
        time: {
          label: 'Tempo',
          error: 'È necessario tempo',
        },
        description: {
          label: 'Descrizione',
          error: 'La descrizione è obbligatoria',
        },
        ticketTypes: {
          sectionTitle: 'Tipi di biglietti',
          type: {
            label: 'Tipo',
            error: 'Seleziona un tipo di biglietto',
          },
          price: {
            label: 'Prezzo',
            error: 'Inserisci un prezzo',
          },
          quantity: {
            label: 'Quantità',
            error: 'Inserisci una quantità',
          },
        },
        tags: {
          label: 'Tag',
        },
        collaborators: {
          label: 'Collaboratori',
          avatarAlt: 'Avatar collaboratore',
        },
        location: {
          label: 'Posizione',
          error: 'La posizione è obbligatoria',
          noOptionHint: 'Digita almeno 3 caratteri per la ricerca',
        },
        poster: {
          label: "Locandina dell'evento",
          error: 'Il manifesto è obbligatorio',
          uploadButtonLabel: 'Carica poster',
        },
        actions: {
          cancel: 'Indietro',
          delete: 'Elimina evento',
          saveDraft: 'Salva bozza',
          updateDraft: 'Aggiorna bozza',
          publishEvent: 'Pubblica evento',
          updatePublishedEvent: 'Aggiorna evento',
        },
        dialog: {
          delete: {
            title: 'Elimina evento',
            message:
              'Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.',
            confirmButton: 'Eliminare',
            cancelButton: 'Indietro',
          },
        },
        messages: {
          errors: {
            updateEventDraft: "Impossibile aggiornare la bozza dell'evento",
            updateEvent: "Impossibile aggiornare l'evento",
            saveEventDraft: "Impossibile salvare la bozza dell'evento",
            saveEvent: "Impossibile salvare l'evento",
            deleteEvent: "Impossibile eliminare l'evento",
            fetchLocations:
              'Impossibile recuperare le posizioni, il servizio è temporaneamente non disponibile',
            imageUpload: "Impossibile caricare l'immagine, riprova",
          },
          success: {
            updateEventDraft: "Bozza dell'evento aggiornata con successo!",
            updateEvent: 'Evento aggiornato con successo!',
            saveEventDraft: "Bozza dell'evento salvata con successo!",
            saveEvent: 'Evento salvato con successo!',
            deleteEvent: 'Evento eliminato con successo!',
          },
        },
      },
      messages: {
        errors: {
          createEvent: "Impossibile creare l'evento",
          loadEvent: "Impossibile caricare l'evento",
        },
      },
    },
    EditProfileView: {
      title: 'Modifica profilo',
      form: {
        name: {
          label: 'Nome',
          placeholder: 'Inserisci il tuo nome',
          error: 'Il nome è obbligatorio',
        },
        bio: {
          label: 'Bio',
          placeholder: 'Inserisci la tua biografia',
        },
        website: {
          label: 'Sito web',
          placeholder: 'https://esempio.com',
        },
        actions: {
          save: 'Salva',
          cancel: 'Indietro',
        },
        messages: {
          errors: {
            imageUpload: "Impossibile caricare l'immagine avatar, riprova",
            profileUpdate: 'Impossibile aggiornare il profilo, riprova',
          },
          success: {
            profileUpdate: 'Profilo aggiornato con successo!',
          },
        },
      },
    },
    ExploreView: {
      searchHint: '@:defaults.searchHint', //[ignorei18n]
    },
    HomeView: {
      searchHint: '@:defaults.searchHint', //[ignorei18n]
    },
    PlaceHolderView: {
      navigationMessageHint: 'Fare clic per tornare a casa',
      navigationMessage: 'Vai a casa',
    },
    PrivacyView: {
      title: 'politica sulla riservatezza',
      lastUpdated: 'Ultimo aggiornamento: 23/01/2025',
      sections: {
        firstSection: {
          title: 'Introduzione',
          content:
            'Noi di EvenToNight ci impegniamo a proteggere la tua privacy. La presente Informativa sulla privacy spiega come raccogliamo, utilizziamo e salvaguardamo le tue informazioni quando utilizzi la nostra piattaforma.',
        },
        secondSection: {
          title: 'Informazioni che raccogliamo',
          content:
            "Raccogliamo le informazioni che ci fornisci direttamente, ad esempio quando crei un account, aggiorni il tuo profilo o acquisti biglietti. Raccogliamo inoltre informazioni automaticamente attraverso l'utilizzo dei nostri servizi, comprese informazioni sul dispositivo e dati di utilizzo.  Tutti i dati vengono raccolti in conformità con il GDPR.",
        },
        thirdSection: {
          title: 'Come utilizziamo le tue informazioni',
          content:
            'Utilizziamo le tue informazioni per fornire e migliorare i nostri servizi, comunicare con te, elaborare transazioni e garantire la sicurezza della nostra piattaforma. Non vendiamo le tue informazioni personali a terzi.',
        },
        fourthSection: {
          title: 'Protezione dei dati',
          content:
            'Implementiamo misure di sicurezza tecniche e organizzative per proteggere i tuoi dati personali da accessi non autorizzati, perdita o alterazione. Utilizziamo la crittografia SSL/TLS per tutte le transazioni.',
        },
        fifthSection: {
          title: 'I tuoi diritti',
          content:
            'Hai il diritto di accedere ai tuoi dati, rettificare dati inesatti, richiederne la cancellazione, opporti al trattamento e richiedere la portabilità dei dati. Per esercitare questi diritti, ti invitiamo a contattarci.',
        },
        sixthSection: {
          title: 'Contattaci',
          content:
            "In caso di domande o dubbi sulla presente Informativa sulla privacy o sulle nostre pratiche relative ai dati, contattaci all'indirizzo privacy{'@'}eventonight.com.",
        },
      },
    },
    ReviewsView: {
      reviewButtonText: 'Lascia una recensione',
      buttonSeparatorText: 'O',
      modifyButtonText: 'Modifica le tue recensioni',
    },
    SettingsView: {
      tabs: {
        general: {
          label: 'Generale',
        },
        language: {
          label: 'Lingua',
        },
        changePassword: {
          label: 'Cambiare la password',
        },
        reviews: {
          label: 'Le mie recensioni',
        },
      },
    },
    TermsView: {
      title: 'Termini e Condizioni',
      lastUpdated: 'Ultimo aggiornamento: 23/01/2025',
      sections: {
        firstSection: {
          title: 'Accordo sui termini',
          content:
            'Utilizzando EvenToNight, accetti di essere vincolato da questi Termini e Condizioni. Se non accetti questi termini, ti preghiamo di non utilizzare la piattaforma.',
        },
        secondSection: {
          title: 'Utilizzo del servizio',
          content:
            'Accetti di utilizzare EvenToNight solo per scopi legittimi e in conformità con tutte le leggi applicabili. Non puoi caricare contenuti offensivi, illegali o che violino i diritti degli altri.',
        },
        thirdSection: {
          title: 'Conto utente',
          content:
            'Sei responsabile della sicurezza del tuo account e delle tue password. È necessario avvisarci immediatamente di qualsiasi accesso non autorizzato. Non puoi trasferire il tuo account a terzi.',
        },
        fourthSection: {
          title: 'Pagamenti e biglietti',
          content:
            "I pagamenti vengono elaborati tramite fornitori di servizi di pagamento sicuri. I prezzi sono chiaramente indicati prima dell'acquisto. Una volta completato l'acquisto, riceverai i biglietti via email.",
        },
        fifthSection: {
          title: 'Rimborsi e Cancellazioni',
          content:
            "La politica di rimborso dipende dall'organizzatore dell'evento. In caso di annullamento dell'evento da parte dell'organizzatore si ha diritto al rimborso totale. Contatta l'assistenza per le richieste di rimborso.",
        },
        sixthSection: {
          title: 'Limitazione di responsabilità',
          content:
            'EvenToNight funge da intermediario della piattaforma tra organizzatori e partecipanti. Non siamo responsabili della qualità degli eventi, delle cancellazioni o dei problemi che si verificano durante gli eventi.',
        },
        seventhSection: {
          title: 'Modifiche ai Termini',
          content:
            "Ci riserviamo il diritto di modificare i presenti Termini e Condizioni in qualsiasi momento. Le modifiche saranno effettive immediatamente dopo la pubblicazione. L'uso continuato della piattaforma implica l'accettazione delle modifiche.",
        },
      },
    },
    TicketPurchaseView: {
      messages: {
        errors: {
          load: "Impossibile caricare i dettagli dell'evento",
          noTicketsSelected: "Seleziona almeno un biglietto per procedere con l'acquisto",
          createCheckoutSession: 'Impossibile creare la sessione di pagamento, riprova',
        },
      },
      ticketSelection: {
        title: 'Seleziona Biglietti',
        available: 'disponibile',
        soldOut: 'Esaurito',
        total: 'Totale',
        ticket: 'Biglietto',
        actions: {
          cancel: 'Indietro',
          continueToPayment: 'Continua al pagamento',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'Identificativo del biglietto',
      loadingTitle: 'Verifica biglietto...',
      loadingMessage: 'Ti preghiamo di attendere mentre verifichiamo il tuo biglietto',
      failedTitle: 'Verifica non riuscita',
      failedMessage:
        'La verifica del biglietto non è riuscita. Controlla il codice del biglietto e riprova.',
      alreadyUsedTitle: 'Biglietto già utilizzato',
      alreadyUsedMessage:
        'Questo biglietto è già stato verificato e utilizzato. Non può essere riutilizzato.',
      successTitle: 'Biglietto verificato con successo!',
      successMessage: 'Questo biglietto è stato verificato e contrassegnato come utilizzato.',
    },
  },

  date: 'Data',
  time: 'Orario',
  location: 'Posizione',
  price: 'Prezzo',
  download: 'Scarica',
  profile: 'Profilo',

  users: {
    organizations: 'Organizzazioni',
    members: 'Utenti',
  },

  brand: {
    appName: 'EvenToNight', //[ignorei18n]
    logo: 'Logo',
  },

  auth: {
    login: 'Accedi',
    register: 'Registrati',
    logout: 'Esci',
    notLoggedIn: "Ops! Non hai effettuato l'accesso",
    loginRequired: "È necessario effettuare l'accesso per eseguire questa azione",
    form: {
      emailLabel: 'E-mail',
      emailError: "L'e-mail è obbligatoria",
      emailFormatError: 'Si prega di inserire un indirizzo email valido',
      passwordLabel: 'Password',
      passwordError: 'La password è obbligatoria',
    },
    loginForm: {
      successfulLogin: 'Accesso riuscito!',
      failedLogin: 'Accesso non riuscito',
      switchToRegister: 'Non hai un account? Registrati',
    },
    registerForm: {
      nameLabel: 'Nome',
      nameError: 'Il nome è obbligatorio',
      confirmPasswordLabel: 'Conferma password',
      emptyConfirmPasswordError: 'Per favore conferma la tua password',
      passwordMismatchError: 'Le password non corrispondono',
      isOrganizationLabel: 'Mi sto registrando come organizzazione',
      successfulRegistration: 'Registrazione riuscita!',
      failedRegistration: 'La registrazione non è riuscita',
      switchToLogin: 'Hai già un account? Accedi',
    },
  },

  cards: {
    slider: {
      seeAll: 'Vedi tutto',
      scrollLeftAriaLabel: 'Scorri a sinistra',
      scrollRightAriaLabel: 'Scorri verso destra',
    },
    eventCard: {
      loadingPoster: 'Caricamento...',
      favoriteButtonAriaLabel: 'metti/togli dai preferiti',
      posterAlt: "Locandina dell'evento",
      draftMissingTitle: 'Evento senza titolo',
    },
    ticketCard: {
      ticket: 'Biglietto',
    },
  },

  event: {
    draft: 'Bozza',
  },

  eventDetails: {
    buyTickets: 'Acquista i biglietti',
    about: 'A proposito di questo evento',
    organizer: 'Organizzato da',
    collaborators: 'In collaborazione con',
    editEvent: 'Modifica',
    freePrice: 'Gratis',
  },

  footer: {
    about: 'Chi siamo',
    events: 'Eventi',
    contact: 'Contatti',
    privacy: 'Privacy Policy',
    terms: 'Termini e Condizioni',
    copyright: 'Tutti i diritti riservati.',
  },

  search: {
    baseHint: 'Ricerca...',
    searchingText: 'Ricerca...',
    noResultsText: 'Nessun risultato trovato',
  },

  userProfile: {
    editProfile: 'Modifica profilo',
    createEvent: 'Crea evento',
    followers: 'Follower',
    following: 'Seguiti',
    follow: 'Segui',
    myTickets: 'I miei biglietti',
    myEvents: 'I miei eventi',
    events: 'Eventi',
    noEventCreated: 'Non hai ancora creato alcun evento.',
    noEventCreatedExternal: 'Questa organizzazione non ha ancora creato alcun evento.',
    noEventJoined: 'Non hai ancora partecipato a nessun evento.',
    noEventJoinedExternal: 'Questo utente non ha ancora partecipato ad alcun evento.',
    noTickets: 'Nessun biglietto disponibile',
    draftedEvents: 'Bozze',
    noDraftedEvents: 'Non hai eventi in bozza.',
    reviews: 'Recensioni',
    noReviews: 'Nessuna recensione ancora.',
    userAvatarAlt: "Avatar dell'utente",
    leaveReview: 'Lascia una recensione',
    selectEvent: 'Seleziona un evento',
    selectRating: 'Seleziona una valutazione:',
    reviewTitle: 'Titolo',
    reviewTitlePlaceholder: 'Dai un titolo alla tua recensione...',
    reviewDescription: 'Descrizione',
    reviewDescriptionPlaceholder: 'Scrivi la tua recensione...',
    cancel: 'Annulla',
    submit: 'Invia',
    noEventFound: 'Nessun evento trovato',
  },

  theme: {
    light_mode: 'Modalità chiara',
    dark_mode: 'Modalità scura',
  },

  home: {
    hero: {
      title: "Trova l'evento che fa per te",
    },
    sections: {
      upcomingEvents: 'Prossimi eventi',
    },
  },
  explore: {
    title: 'Esplora',
    subtitile: 'Trova eventi, organizzatori o connettiti con i tuoi amici',
    events: {
      title: 'Eventi',
      emptySearch: 'Nessun evento trovato',
      emptySearchText: 'Cerca eventi per nome',
    },
    organizations: {
      title: 'Organizzazioni',
      emptySearch: 'Nessuna organizzazione trovata',
      emptySearchText: 'Cerca organizzazioni per nome',
    },
    users: {
      title: 'Utenti',
      emptySearch: 'Nessun utente trovato',
      emptySearchText: 'Cerca gli utenti per nome',
    },
  },

  filters: {
    filters: 'Filtri',
    cancel: 'Annulla',
    delete: 'Cancella',
    apply: 'Applica',
    dateFilters: {
      date: 'Data',
      selectPeriod: 'Seleziona Periodo',
      today: 'Oggi',
      thisWeek: 'Questa settimana',
      thisMonth: 'Questo mese',
    },
    feedFilters: {
      others: 'Altri',
      upcoming: 'Prossimamente',
      popular: 'Popolari',
      nearby: 'Nelle vicinanze',
      forYou: 'Per te',
      new: 'Nuovi',
    },
    priceFilters: {
      price: 'Prezzo',
      selectPrice: 'Seleziona fascia di prezzo',
      minPrice: 'Prezzo minimo',
      maxPrice: 'Prezzo massimo',
      customize: 'Personalizza',
      free: 'Gratuito',
      paid: 'A pagamento',
      from: 'Da',
      to: 'A',
    },
    sortFilters: {
      sort: 'Ordina per',
      date_asc: 'Data di crescente',
      date_desc: 'Data decrescente',
      price_asc: 'Prezzo crescente',
      price_desc: 'Prezzo decrescente',
    },
    TagFilters: {
      tags: 'Tag',
    },
  },
}
