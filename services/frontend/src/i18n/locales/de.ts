export default {
  date: 'Datum',
  time: 'Zeit',
  location: 'Standort',
  price: 'Preis',
  download: 'Herunterladen',
  profile: 'Profil',

  users: {
    organizations: 'Organisationen',
    members: 'Benutzer',
  },

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
      posterAlt: 'Veranstaltungsplakat',
      draftMissingTitle: 'Veranstaltung ohne Titel',
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
    about: 'Über diese Veranstaltung',
    organizer: 'Organisiert von',
    collaborators: 'In Zusammenarbeit mit',
    editEvent: 'Bearbeiten',
    freePrice: 'Frei',
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
    reviews: 'Rezensionen',
    noReviews: 'Noch keine Bewertungen.',
    userAvatarAlt: 'Benutzer-Avatar',
    leaveReview: 'Hinterlassen Sie eine Bewertung',
    selectEvent: 'Ereignis auswählen',
    selectRating: 'Bewertung auswählen:',
    reviewTitle: 'Titel',
    reviewTitlePlaceholder: 'Geben Sie Ihrer Rezension einen Titel...',
    reviewDescription: 'Beschreibung',
    reviewDescriptionPlaceholder: 'Schreiben Sie Ihre Bewertung...',
    cancel: 'Stornieren',
    submit: 'Einreichen',
    noEventFound: 'Keine Veranstaltung gefunden',
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
    descriptionError: 'Beschreibung ist erforderlich',
    price: 'Preis',
    priceError: 'Preis ist erforderlich',
    tags: 'Schlagworte',
    collaborators: 'Mitarbeiter',
    collaboratorAvatarAlt: 'Mitarbeiter-Avatar',
    location: 'Standort',
    locationError: 'Der Standort ist erforderlich',
    eventPoster: 'Veranstaltungsplakat',
    posterError: 'Poster ist erforderlich',
    uploadPoster: 'Poster hochladen',
    cancel: 'Stornieren',
    deleteEvent: 'Löschen',
    deleteEventConfirm:
      'Sind Sie sicher, dass Sie dieses Ereignis löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
    saveDraft: 'Entwurf speichern',
    publishEvent: 'Veranstaltung veröffentlichen',
    updateEvent: 'Ereignis aktualisieren',
    locationNoOptionHint: 'Geben Sie für die Suche mindestens 3 Zeichen ein',
    successForEventPublication: 'Veranstaltung erfolgreich veröffentlicht!',
    successForEventUpdate: 'Veranstaltung erfolgreich aktualisiert!',
    successForEventDeletion: 'Veranstaltung erfolgreich gelöscht!',
    errorForEventCreation: 'Bitte füllen Sie alle erforderlichen Felder aus',
    errorForEventPublication:
      'Ereignis konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
    errorForEventUpdate:
      'Das Ereignis konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
    errorForEventDeletion: 'Ereignis konnte nicht gelöscht werden. Bitte versuchen Sie es erneut.',
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
  explore: {
    title: 'Erkunden',
    subtitile:
      'Finden Sie Veranstaltungen, Organisatoren oder vernetzen Sie sich mit Ihren Freunden',
    events: {
      title: 'Veranstaltungen',
      emptySearch: 'Keine Veranstaltungen gefunden',
      emptySearchText: 'Suchen Sie nach Ereignissen nach Namen',
    },
    organizations: {
      title: 'Organisationen',
      emptySearch: 'Keine Organisationen gefunden',
      emptySearchText: 'Suchen Sie nach Organisationen nach Namen',
    },
    users: {
      title: 'Benutzer',
      emptySearch: 'Keine Benutzer gefunden',
      emptySearchText: 'Suchen Sie Benutzer nach Namen',
    },
  },

  filters: {
    filters: 'Filter',
    cancel: 'Stornieren',
    delete: 'Klar',
    apply: 'Anwenden',
    dateFilters: {
      date: 'Datum',
      selectPeriod: 'Wählen Sie Zeitraum aus',
      today: 'Heute',
      thisWeek: 'Diese Woche',
      thisMonth: 'Diesen Monat',
    },
    feedFilters: {
      others: 'Andere',
      upcoming: 'Demnächst',
      popular: 'Beliebt',
      nearby: 'Nahe',
      forYou: 'Für Sie',
      new: 'Neu',
    },
    priceFilters: {
      price: 'Preis',
      selectPrice: 'Wählen Sie Preisspanne aus',
      minPrice: 'Mindestpreis',
      maxPrice: 'Maximaler Preis',
      customize: 'Anpassen',
      free: 'Frei',
      paid: 'Bezahlt',
      from: 'Aus',
      to: 'Zu',
    },
    sortFilters: {
      sort: 'Sortieren nach',
      date_asc: 'Aufstiegsdatum',
      date_desc: 'Absteigendes Datum',
      price_asc: 'Steigender Preis',
      price_desc: 'Absteigender Preis',
    },
    TagFilters: {
      tags: 'Schlagworte',
    },
  },
}
