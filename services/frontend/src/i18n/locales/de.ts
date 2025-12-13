export default {
  date: 'Datum',
  time: 'Zeit',
  location: 'Standort',
  price: 'Preis',
  download: 'Herunterladen',
  profile: 'Profil',

  brand: {
    appName: 'EvenToNight', //[ignorei18n]
    logo: 'Logo',
  },

  auth: {
    login: 'Melden Sie sich an',
    register: 'Anmelden',
    logout: 'Abmelden',
    notLoggedIn: 'Hoppla! Nicht angemeldet',
    loginRequired: 'Sie müssen angemeldet sein, um diese Aktion auszuführen',
    form: {
      emailLabel: 'E-Mail',
      emailError: 'E-Mail ist erforderlich',
      emailFormatError: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
      passwordLabel: 'Passwort',
      passwordError: 'Passwort ist erforderlich',
    },
    loginForm: {
      successfulLogin: 'Anmeldung erfolgreich!',
      failedLogin: 'Fehler bei der Anmeldung',
      switchToRegister: 'Benötigen Sie ein Konto? Registrieren',
    },
    registerForm: {
      nameLabel: 'Name',
      nameError: 'Name ist erforderlich',
      confirmPasswordLabel: 'Passwort bestätigen',
      emptyConfirmPasswordError: 'Bitte bestätigen Sie Ihr Passwort',
      passwordMismatchError: 'Passwörter stimmen nicht überein',
      isOrganizationLabel: 'Ich registriere mich als Organisation',
      successfulRegistration: 'Registrierung erfolgreich!',
      failedRegistration: 'Die Registrierung ist fehlgeschlagen',
      switchToLogin: 'Sie haben bereits ein Konto? Login',
    },
  },

  cards: {
    slider: {
      seeAll: 'Alle anzeigen',
      scrollLeftAriaLabel: 'Scrollen Sie nach links',
      scrollRightAriaLabel: 'Scrollen Sie nach rechts',
    },
    eventCard: {
      loadingPoster: 'Laden...',
      favoriteButtonAriaLabel: 'Favoriten umschalten',
    },
    ticketCard: {
      ticket: 'Ticket',
    },
  },

  event: {
    draft: 'Entwurf',
  },

  eventDetails: {
    buyTickets: 'Kaufen Sie Tickets',
    about: 'Um',
    organizer: 'Organisiert von',
    collaborators: 'Mitarbeiter',
    editEvent: 'Bearbeiten',
  },

  footer: {
    about: 'Um',
    events: 'Veranstaltungen',
    contact: 'Kontakt',
    privacy: 'Datenschutzrichtlinie',
    copyright: 'Alle Rechte vorbehalten.',
  },

  search: {
    baseHint: 'Suchen...',
    searchingText: 'Suche...',
    noResultsText: 'Keine Ergebnisse gefunden',
  },

  userProfile: {
    editProfile: 'Profil bearbeiten',
    createEvent: 'Ereignis erstellen',
    followers: 'Anhänger',
    following: 'Nachfolgend',
    follow: 'Folgen',
    myTickets: 'Meine Tickets',
    myEvents: 'Meine Veranstaltungen',
    events: 'Veranstaltungen',
    noEventCreated: 'Sie haben noch keine Veranstaltungen erstellt.',
    noEventCreatedExternal: 'Diese Organisation hat noch keine Veranstaltungen erstellt.',
    noEventJoined: 'Sie haben noch keine Veranstaltungen besucht.',
    noEventJoinedExternal: 'Dieser Benutzer hat noch keine Veranstaltungen besucht.',
    noTickets: 'Noch keine Tickets',
    draftedEvents: 'Entworfene Ereignisse',
    noDraftedEvents: 'Sie haben keine geplanten Ereignisse.',
    userAvatarAlt: 'Benutzer-Avatar',
  },

  eventCreationForm: {
    createNewEvent: 'Neues Ereignis erstellen',
    editEvent: 'Ereignis bearbeiten',
    eventTitle: 'Veranstaltungstitel',
    titleError: 'Titel ist erforderlich',
    date: 'Datum',
    dateError: 'Datum ist erforderlich',
    time: 'Zeit',
    timeError: 'Zeit ist erforderlich',
    description: 'Beschreibung',
    price: 'Preis',
    priceError: 'Preis ist erforderlich',
    tags: 'Schlagworte',
    collaborators: 'Mitarbeiter',
    collaboratorAvatarAlt: 'Mitarbeiter-Avatar',
    location: 'Standort',
    locationError: 'Der Standort ist erforderlich',
    eventPoster: 'Veranstaltungsplakat',
    uploadPoster: 'Poster hochladen',
    cancel: 'Stornieren',
    saveDraft: 'Entwurf speichern',
    publishEvent: 'Veranstaltung veröffentlichen',
    updateEvent: 'Ereignis aktualisieren',
    locationNoOptionHint: 'Geben Sie für die Suche mindestens 3 Zeichen ein',
    errorForDraftCreation: 'Bitte geben Sie mindestens einen Titel für den Entwurf an',
    successForEventPublication: 'Veranstaltung erfolgreich veröffentlicht!',
    successForEventUpdate: 'Veranstaltung erfolgreich aktualisiert!',
    errorForEventCreation: 'Bitte füllen Sie alle erforderlichen Felder aus',
    errorForEventPublication: 'Failed to create event. Please try again.',
    errorForEventUpdate:
      'Das Ereignis konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
    errorForEventLoad: 'Ereignis konnte nicht geladen werden. Bitte versuchen Sie es erneut.',
  },

  theme: {
    light_mode: 'Lichtmodus',
    dark_mode: 'Dunkler Modus',
  },

  home: {
    hero: {
      title: 'Finden Sie die Veranstaltung für Sie',
    },
    sections: {
      upcomingEvents: 'Kommende Veranstaltungen',
    },
  },
}
