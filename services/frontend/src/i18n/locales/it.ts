export default {
  meta: {
    description:
      "Trova l'evento che fa per te. Cerca i prossimi eventi e scopri esperienze straordinarie.",
    keywords: 'eventi, movida, concerti, feste, eventi notturni',
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
          cancel: 'Torna indietro',
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
            cancelButton: 'Torna indietro',
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
