export default {
  date: 'Data',
  time: 'Ora',
  location: 'Posizione',
  price: 'Prezzo',
  download: 'Scarica',
  profile: 'Profilo',

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
      passwordError: 'È richiesta la password',
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
      isOrganizationLabel: "Sono un'organizzazione",
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
    about: 'Descrizione',
    organizer: 'Organizzato da',
    collaborators: 'Collaboratori',
    editEvent: 'Modifica evento',
  },

  footer: {
    about: 'Informazioni',
    events: 'Eventi',
    contact: 'Contatti',
    privacy: 'Privacy',
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
    following: 'Seguiti',
    follow: 'Segui',
    myTickets: 'I miei biglietti',
    myEvents: 'I miei eventi',
    events: 'Eventi',
    noEventCreated: 'Non hai ancora creato alcun evento.',
    noEventCreatedExternal: 'Questa organizzazione non ha ancora creato alcun evento.',
    noEventJoined: 'Non hai ancora partecipato a nessun evento.',
    noEventJoinedExternal: 'Questo utente non ha ancora partecipato ad alcun evento.',
    noTickets: 'Nessun biglietto presente',
    draftedEvents: 'Bozze',
    noDraftedEvents: 'Non hai bozze di eventi.',
    userAvatarAlt: "Avatar dell'utente",
  },

  eventCreationForm: {
    createNewEvent: 'Crea nuovo evento',
    editEvent: 'Modifica evento',
    eventTitle: "Titolo dell'evento",
    titleError: 'Il titolo è obbligatorio',
    date: 'Data',
    dateError: 'La data è obbligatoria',
    time: 'Ora',
    timeError: "L'ora è obbligatoria",
    description: 'Descrizione',
    descriptionError: 'La descrizione è obbligatoria',
    price: 'Prezzo',
    priceError: 'Il prezzo è obbligatorio',
    tags: 'Tag',
    collaborators: 'Collaboratori',
    collaboratorAvatarAlt: 'Avatar collaboratore',
    location: 'Posizione',
    locationError: 'La posizione è obbligatoria',
    eventPoster: "Locandina dell'evento",
    posterError: 'La locandina è obbligatoria',
    uploadPoster: 'Carica locandina',
    cancel: 'Annulla',
    deleteEvent: 'Elimina',
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
    light_mode: 'Modalità Chiara',
    dark_mode: 'Modalità Scura',
  },

  home: {
    hero: {
      title: "Trova l'evento che fa per te",
    },
    sections: {
      upcomingEvents: 'Prossimi eventi',
    },
  },
}
