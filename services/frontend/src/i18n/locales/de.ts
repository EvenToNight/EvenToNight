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
    PlaceHolderView: {
      navigationMessageHint: 'Klicken Sie hier, um zur Startseite zu gelangen',
      navigationMessage: 'Gehen Sie zu Startseite',
    },
    PrivacyView: {
      title: 'Datenschutzrichtlinie',
      lastUpdated: 'Letzte Aktualisierung: 23.01.2025',
      sections: {
        firstSection: {
          title: 'Einführung',
          content:
            'Bei EvenToNight sind wir dem Schutz Ihrer Privatsphäre verpflichtet. In dieser Datenschutzrichtlinie wird erläutert, wie wir Ihre Daten erfassen, verwenden und schützen, wenn Sie unsere Plattform nutzen.',
        },
        secondSection: {
          title: 'Informationen, die wir sammeln',
          content:
            'Wir erfassen Informationen, die Sie uns direkt zur Verfügung stellen, beispielsweise wenn Sie ein Konto erstellen, Ihr Profil aktualisieren oder Tickets kaufen. Wir erfassen durch Ihre Nutzung unserer Dienste auch automatisch Informationen, einschließlich Geräteinformationen und Nutzungsdaten.  Alle Daten werden im Einklang mit der DSGVO erhoben.',
        },
        thirdSection: {
          title: 'Wie wir Ihre Informationen verwenden',
          content:
            'Wir nutzen Ihre Daten, um unsere Dienste bereitzustellen und zu verbessern, mit Ihnen zu kommunizieren, Transaktionen abzuwickeln und die Sicherheit unserer Plattform zu gewährleisten. Wir verkaufen Ihre persönlichen Daten nicht an Dritte.',
        },
        fourthSection: {
          title: 'Datenschutz',
          content:
            'Wir setzen technische und organisatorische Sicherheitsmaßnahmen ein, um Ihre personenbezogenen Daten vor unbefugtem Zugriff, Verlust oder Veränderung zu schützen. Wir verwenden für alle Transaktionen eine SSL/TLS-Verschlüsselung.',
        },
        fifthSection: {
          title: 'Ihre Rechte',
          content:
            'Sie haben das Recht, auf Ihre Daten zuzugreifen, unrichtige Daten zu berichtigen, die Löschung zu verlangen, der Verarbeitung zu widersprechen und die Datenübertragbarkeit zu beantragen. Um diese Rechte auszuüben, kontaktieren Sie uns bitte.',
        },
        sixthSection: {
          title: 'Kontaktieren Sie uns',
          content:
            "Wenn Sie Fragen oder Bedenken zu dieser Datenschutzrichtlinie oder unseren Datenpraktiken haben, kontaktieren Sie uns bitte unter Privacy{'@'}eventonight.com.",
        },
      },
    },
    ReviewsView: {
      reviewButtonText: 'Hinterlassen Sie eine Bewertung',
      buttonSeparatorText: 'oder',
      modifyButtonText: 'Ändern Sie Ihre Bewertungen',
    },
    SettingsView: {
      tabs: {
        general: {
          label: 'Allgemein',
        },
        language: {
          label: 'Sprache',
        },
        changePassword: {
          label: 'Kennwort ändern',
        },
        reviews: {
          label: 'Meine Bewertungen',
        },
      },
    },
    TermsView: {
      title: 'Geschäftsbedingungen',
      lastUpdated: 'Letzte Aktualisierung: 23.01.2025',
      sections: {
        firstSection: {
          title: 'Zustimmung zu den Bedingungen',
          content:
            'Durch die Nutzung von EvenToNight erklären Sie sich mit diesen Allgemeinen Geschäftsbedingungen einverstanden. Wenn Sie mit diesen Bedingungen nicht einverstanden sind, nutzen Sie die Plattform bitte nicht.',
        },
        secondSection: {
          title: 'Nutzung des Dienstes',
          content:
            'Sie erklären sich damit einverstanden, EvenToNight nur für rechtmäßige Zwecke und in Übereinstimmung mit allen geltenden Gesetzen zu nutzen. Sie dürfen keine Inhalte hochladen, die anstößig oder illegal sind oder die Rechte anderer verletzen.',
        },
        thirdSection: {
          title: 'Benutzerkonto',
          content:
            'Sie sind für die Sicherheit Ihres Kontos und Ihrer Passwörter verantwortlich. Sie müssen uns unverzüglich über jeden unbefugten Zugriff informieren. Sie dürfen Ihr Konto nicht an Dritte übertragen.',
        },
        fourthSection: {
          title: 'Zahlungen und Tickets',
          content:
            'Die Zahlungsabwicklung erfolgt über sichere Zahlungsdienstleister. Die Preise werden vor dem Kauf klar angegeben. Sobald der Kauf abgeschlossen ist, erhalten Sie die Tickets per E-Mail.',
        },
        fifthSection: {
          title: 'Rückerstattungen und Stornierungen',
          content:
            'Die Rückerstattungsbedingungen hängen vom Veranstalter ab. Im Falle einer Absage der Veranstaltung durch den Veranstalter haben Sie Anspruch auf eine volle Rückerstattung. Wenden Sie sich für Rückerstattungsanfragen an den Support.',
        },
        sixthSection: {
          title: 'Haftungsbeschränkung',
          content:
            'EvenToNight fungiert als Plattformvermittler zwischen Veranstaltern und Teilnehmern. Wir sind nicht verantwortlich für die Qualität von Veranstaltungen, Absagen oder Probleme, die während der Veranstaltungen auftreten.',
        },
        seventhSection: {
          title: 'Änderungen der Bedingungen',
          content:
            'Wir behalten uns das Recht vor, diese Allgemeinen Geschäftsbedingungen jederzeit zu ändern. Änderungen werden sofort nach der Veröffentlichung wirksam. Durch die weitere Nutzung der Plattform akzeptieren Sie die Änderungen.',
        },
      },
    },
    TicketPurchaseView: {
      messages: {
        errors: {
          load: 'Ereignisdetails konnten nicht geladen werden',
          noTicketsSelected:
            'Bitte wählen Sie mindestens ein Ticket aus, um mit dem Kauf fortzufahren',
          createCheckoutSession:
            'Fehler beim Erstellen der Checkout-Sitzung. Bitte versuchen Sie es erneut',
        },
      },
      ticketSelection: {
        title: 'Wählen Sie Tickets aus',
        available: 'verfügbar',
        soldOut: 'Ausverkauft',
        total: 'Gesamt',
        ticket: 'Ticket',
        actions: {
          cancel: 'Zurück',
          continueToPayment: 'Weiter zur Zahlung',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'Ticket-ID',
      loadingTitle: 'Ticket wird überprüft...',
      loadingMessage: 'Bitte warten Sie, während wir Ihr Ticket überprüfen',
      failedTitle: 'Überprüfung fehlgeschlagen',
      failedMessage:
        'Die Ticketüberprüfung ist fehlgeschlagen. Bitte überprüfen Sie den Ticketcode und versuchen Sie es erneut.',
      alreadyUsedTitle: 'Ticket bereits verwendet',
      alreadyUsedMessage:
        'Dieses Ticket wurde bereits verifiziert und verwendet. Es kann nicht erneut verwendet werden.',
      successTitle: 'Ticket erfolgreich verifiziert!',
      successMessage: 'Dieses Ticket wurde verifiziert und als verwendet markiert.',
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
