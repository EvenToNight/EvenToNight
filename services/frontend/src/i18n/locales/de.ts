export default {
  meta: {
    description:
      'Finden Sie die Veranstaltung für Sie. Suchen Sie nach bevorstehenden Veranstaltungen und entdecken Sie tolle Erlebnisse.',
    keywords: 'Veranstaltungen, Nachtleben, Konzerte, Partys, Nachtveranstaltungen',
  },

  defaults: {
    searchHint: 'Suchen Sie nach Ereignissen, Organisationen oder Benutzern ...',
  },

  views: {
    AboutView: {
      title: 'Über uns',
      firstSectionTitle: 'Unsere Mission',
      firstSectionContent:
        'EvenToNight wurde mit dem Ziel ins Leben gerufen, Menschen durch einzigartige Erlebnisse zu verbinden. Wir glauben, dass jede Veranstaltung eine Gelegenheit ist, unvergessliche Erinnerungen zu schaffen und Gemeinschaften aufzubauen.',
      secondSectionTitle: 'Unsere Geschichte',
      secondSectionContent:
        'EvenToNight wurde 2025 gegründet und hat sich schnell zur bevorzugten Plattform für die Entdeckung und Verwaltung von Veranstaltungen entwickelt. Vom ersten Tag an haben wir daran gearbeitet, die Organisation und Teilnahme an Veranstaltungen einfach und für jedermann zugänglich zu machen.',
      thirdSectionTitle: 'Unsere Werte',
      thirdSectionItems: {
        item1: 'Transparenz in Kommunikation und Transaktionen',
        item2: 'Die Gemeinschaft steht im Mittelpunkt unseres Handelns',
        item3: 'Kontinuierliche Innovation zur Verbesserung des Benutzererlebnisses',
      },
    },
    CreateEventView: {
      title: {
        new: 'Neues Ereignis erstellen',
        edit: 'Ereignis bearbeiten',
      },
      form: {
        title: {
          label: 'Veranstaltungstitel',
          error: 'Titel ist erforderlich',
        },
        date: {
          label: 'Datum',
          error: 'Datum ist erforderlich',
        },
        time: {
          label: 'Zeit',
          error: 'Zeit ist erforderlich',
        },
        description: {
          label: 'Beschreibung',
          error: 'Beschreibung ist erforderlich',
        },
        ticketTypes: {
          sectionTitle: 'Ticketarten',
          type: {
            label: 'Typ',
            error: 'Bitte wählen Sie eine Ticketart aus',
          },
          price: {
            label: 'Preis',
            error: 'Bitte geben Sie einen Preis ein',
          },
          quantity: {
            label: 'Menge',
            error: 'Bitte geben Sie eine Menge ein',
          },
        },
        tags: {
          label: 'Schlagworte',
        },
        collaborators: {
          label: 'Mitarbeiter',
          avatarAlt: 'Mitarbeiter-Avatar',
        },
        location: {
          label: 'Standort',
          error: 'Der Standort ist erforderlich',
          noOptionHint: 'Geben Sie für die Suche mindestens 3 Zeichen ein',
        },
        poster: {
          label: 'Veranstaltungsplakat',
          error: 'Poster ist erforderlich',
          uploadButtonLabel: 'Poster hochladen',
        },
        actions: {
          cancel: 'Zurück',
          delete: 'Ereignis löschen',
          saveDraft: 'Entwurf speichern',
          updateDraft: 'Entwurf aktualisieren',
          publishEvent: 'Veranstaltung veröffentlichen',
          updatePublishedEvent: 'Ereignis aktualisieren',
        },
        dialog: {
          delete: {
            title: 'Ereignis löschen',
            message:
              'Sind Sie sicher, dass Sie dieses Ereignis löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
            confirmButton: 'Löschen',
            cancelButton: 'Zurück',
          },
        },
        messages: {
          errors: {
            updateEventDraft: 'Der Ereignisentwurf konnte nicht aktualisiert werden',
            updateEvent: 'Das Ereignis konnte nicht aktualisiert werden',
            saveEventDraft: 'Der Veranstaltungsentwurf konnte nicht gespeichert werden',
            saveEvent: 'Ereignis konnte nicht gespeichert werden',
            deleteEvent: 'Ereignis konnte nicht gelöscht werden',
            fetchLocations:
              'Standorte konnten nicht abgerufen werden, der Dienst ist vorübergehend nicht verfügbar',
            imageUpload:
              'Das Hochladen des Bildes ist fehlgeschlagen. Bitte versuchen Sie es erneut',
          },
          success: {
            updateEventDraft: 'Veranstaltungsentwurf erfolgreich aktualisiert!',
            updateEvent: 'Veranstaltung erfolgreich aktualisiert!',
            saveEventDraft: 'Veranstaltungsentwurf erfolgreich gespeichert!',
            saveEvent: 'Veranstaltung erfolgreich gespeichert!',
            deleteEvent: 'Veranstaltung erfolgreich gelöscht!',
          },
        },
      },
      messages: {
        errors: {
          createEvent: 'Ereignis konnte nicht erstellt werden',
          loadEvent: 'Ereignis konnte nicht geladen werden',
        },
      },
    },
    EditProfileView: {
      title: 'Profil bearbeiten',
      form: {
        name: {
          label: 'Name',
          placeholder: 'Geben Sie Ihren Namen ein',
          error: 'Name ist erforderlich',
        },
        bio: {
          label: 'Bio',
          placeholder: 'Geben Sie Ihre Biografie ein',
        },
        website: {
          label: 'Webseite',
          placeholder: 'https://example.com',
        },
        actions: {
          save: 'Speichern',
          cancel: 'Zurück',
        },
        messages: {
          errors: {
            imageUpload:
              'Das Hochladen des Avatarbildes ist fehlgeschlagen. Bitte versuchen Sie es erneut',
            profileUpdate:
              'Das Profil konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut',
          },
          success: {
            profileUpdate: 'Profil erfolgreich aktualisiert!',
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
  },

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
    terms: 'Geschäftsbedingungen',
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
