export default {
  date: 'Data',
  time: 'Tempo',
  location: 'Posizione',
  price: 'Prezzo',
  download: 'Scaricamento',
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
    login: 'Iscrizione',
    register: 'Registrazione',
    logout: 'Esci',
    notLoggedIn: "Ops! Non effettuato l'accesso",
    loginRequired: "È necessario effettuare l'accesso per eseguire questa azione",
    form: {
      emailLabel: 'E-mail',
      emailError: "L'e-mail è obbligatoria",
      emailFormatError: 'Si prega di inserire un indirizzo email valido',
      passwordLabel: 'Password',
      passwordError: 'È richiesta la password',
    },
    loginForm: {
      successfulLogin: 'Accesso riuscito!',
      failedLogin: 'Accesso non riuscito',
      switchToRegister: 'Hai bisogno di un account? Registro',
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
      switchToLogin: 'Hai già un account? Login',
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
      favoriteButtonAriaLabel: 'Attiva/disattiva preferiti',
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
    contact: 'Contattaci',
    privacy: 'politica sulla riservatezza',
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
    followers: 'Seguaci',
    following: 'Seguente',
    follow: 'Seguire',
    myTickets: 'I miei biglietti',
    myEvents: 'I miei eventi',
    events: 'Eventi',
    noEventCreated: 'Non hai ancora creato alcun evento.',
    noEventCreatedExternal: 'Questa organizzazione non ha ancora creato alcun evento.',
    noEventJoined: 'Non hai ancora partecipato a nessun evento.',
    noEventJoinedExternal: 'Questo utente non ha ancora partecipato ad alcun evento.',
    noTickets: 'Nessun biglietto ancora',
    draftedEvents: 'Eventi redatti',
    noDraftedEvents: 'Non hai eventi in bozza.',
    reviews: 'Recensioni',
    noReviews: 'Nessuna recensione ancora.',
    userAvatarAlt: "Avatar dell'utente",
    leaveReview: 'Lascia una recensione',
    selectEvent: 'Seleziona evento',
    selectRating: 'Seleziona il rating:',
    reviewTitle: 'Titolo',
    reviewTitlePlaceholder: 'Dai un titolo alla tua recensione...',
    reviewDescription: 'Descrizione',
    reviewDescriptionPlaceholder: 'Scrivi la tua recensione...',
    cancel: 'Annulla',
    submit: 'Invia',
    noEventFound: 'Nessun evento trovato',
  },

  eventCreationForm: {
    createNewEvent: 'Crea nuovo evento',
    editEvent: 'Modifica evento',
    eventTitle: "Titolo dell'evento",
    titleError: 'Il titolo è obbligatorio',
    date: 'Data',
    dateError: 'La data è obbligatoria',
    time: 'Tempo',
    timeError: 'È necessario tempo',
    description: 'Descrizione',
    descriptionError: 'La descrizione è obbligatoria',
    price: 'Prezzo',
    priceError: 'Il prezzo è richiesto',
    tags: 'Tag',
    collaborators: 'Collaboratori',
    collaboratorAvatarAlt: 'Avatar collaboratore',
    location: 'Posizione',
    locationError: 'La posizione è obbligatoria',
    eventPoster: "Locandina dell'evento",
    posterError: 'Il manifesto è obbligatorio',
    uploadPoster: 'Carica poster',
    cancel: 'Cancellare',
    deleteEvent: 'Eliminare',
    deleteEventConfirm:
      'Sei sicuro di voler eliminare questo evento? Questa azione non può essere annullata.',
    saveDraft: 'Salva bozza',
    publishEvent: 'Pubblica evento',
    updateEvent: 'Aggiorna evento',
    locationNoOptionHint: 'Digita almeno 3 caratteri per la ricerca',
    successForEventPublication: 'Evento pubblicato con successo!',
    successForEventUpdate: 'Evento aggiornato con successo!',
    successForEventDeletion: 'Evento eliminato con successo!',
    errorForEventCreation: 'Si prega di compilare tutti i campi obbligatori',
    errorForEventPublication: "Impossibile creare l'evento. Per favore riprova.",
    errorForEventUpdate: "Impossibile aggiornare l'evento. Per favore riprova.",
    errorForEventDeletion: "Impossibile eliminare l'evento. Per favore riprova.",
    errorForEventLoad: "Impossibile caricare l'evento. Per favore riprova.",
  },

  theme: {
    light_mode: 'Modalità luce',
    dark_mode: 'Modalità oscura',
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
    cancel: 'Cancella',
    delete: 'Annulla',
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
      paid: 'A Pagamento',
      from: 'Da',
      to: 'A',
    },
    sortFilters: {
      sort: 'Ordina per',
      date_asc: 'Data crescente',
      date_desc: 'Data decrescente',
      price_asc: 'Prezzo crescente',
      price_desc: 'Prezzo decrescente',
    },
    TagFilters: {
      tags: 'Tag',
    },
  },
}
