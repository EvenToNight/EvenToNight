export default {
  meta: {
    description:
      'Finden Sie die Veranstaltung für Sie. Suchen Sie nach bevorstehenden Veranstaltungen und entdecken Sie tolle Erlebnisse.',
    keywords: 'Veranstaltungen, Nachtleben, Konzerte, Partys, Nachtveranstaltungen',
  },

  defaults: {
    searchHint: 'Suchen Sie nach Ereignissen, Organisationen oder Benutzern ...',
    login: 'Anmelden',
    register: 'Melden Sie sich an',
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
          addTicketButton: 'Tickettyp hinzufügen',
          deleteTicketButton: 'Tickettyp löschen',
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
        quantityAriaLabel: 'Mengeneingabe für',
        total: 'Gesamt',
        ticket: 'Ticket',
        actions: {
          cancel: 'Zurück',
          continueToPayment: 'Weiter zur Zahlung',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'Ticket-ID', //[ignorei18n]
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
  components: {
    auth: {
      AuthButtons: {
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      AuthRequiredDialog: {
        title: 'Hoppla! Nicht angemeldet',
        message: 'Sie müssen angemeldet sein, um diese Aktion auszuführen',
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      LoginForm: {
        title: '@:defaults.login', //[ignorei18n]
        successfulLogin: 'Anmeldung erfolgreich!',
        failedLogin: 'Falscher Benutzername oder Passwort',
        switchToRegister: 'Benötigen Sie ein Konto? Registrieren',
        usernameOrEmailLabel: 'Benutzername oder E-Mail',
        usernameOrEmailError: 'Benutzername oder E-Mail ist erforderlich',
        passwordLabel: 'Passwort',
        passwordError: 'Passwort ist erforderlich',
        login: '@:defaults.login', //[ignorei18n]
      },
      RegisterForm: {
        title: '@:defaults.register', //[ignorei18n]
        successfulRegistration: 'Registrierung erfolgreich!',
        failedRegistration: 'Die Registrierung ist fehlgeschlagen',
        switchToLogin: 'Sie haben bereits ein Konto? Login',
        nameLabel: 'Name',
        nameError: 'Name ist erforderlich',
        emailLabel: 'E-Mail',
        emailError: 'E-Mail ist erforderlich',
        emailFormatError: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        passwordLabel: 'Passwort',
        passwordError: 'Passwort ist erforderlich',
        confirmPasswordLabel: 'Passwort bestätigen',
        emptyConfirmPasswordError: 'Bitte bestätigen Sie Ihr Passwort',
        passwordMismatchError: 'Passwörter stimmen nicht überein',
        isOrganizationLabel: 'Ich registriere mich als Organisation',
        register: '@:defaults.register', //[ignorei18n]
      },
    },
    buttons: {
      actionButtons: {
        BackHomeButton: {
          goToHome: 'Geh nach Hause',
        },
        BackButton: {
          goBack: 'Geh zurück',
        },
        HomeButton: {
          goToHome: 'Geh nach Hause',
        },
        CloseButton: {
          close: 'Schließen',
        },
      },
      basicButtons: {
        SeeAllButton: {
          seeAll: 'Alle anzeigen',
        },
      },
    },
    cards: {
      CardSlider: {
        scrollLeftAriaLabel: 'Scrollen Sie nach links',
        scrollRightAriaLabel: 'Scrollen Sie nach rechts',
      },
      EventCard: {
        posterAlt: 'Veranstaltungsplakat',
        favoriteButtonAriaLabel: 'Favoriten umschalten',
        draftBadge: 'Entwurf',
        cancelledBadge: 'Abgesagt',
        draftMissingTitle: 'Veranstaltung ohne Titel',
      },
      ReviewCard: {
        deleteDialog: {
          title: 'Bestätigen Sie den Löschvorgang',
          message:
            'Sind Sie sicher, dass Sie diese Bewertung löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.',
          cancelLabel: 'Zurück',
          confirmLabel: 'Löschen',
          failedDelete: 'Beim Versuch, die Bewertung zu löschen, ist ein Fehler aufgetreten',
        },
        menu: {
          edit: 'Bearbeiten',
          delete: 'Löschen',
        },
      },
      SearchResultCard: {
        eventPosterAlt: 'Veranstaltungsplakat',
        userAvatarAlt: 'Benutzer-Avatar',
        event: 'Ereignis',
        organization: 'Organisation',
        member: 'Benutzer',
      },
      UserInfoCard: {
        avatarAlt: 'Benutzer-Avatar',
      },
    },
    chat: {
      ChatArea: {
        today: 'Heute',
        yesterday: 'Gestern',
        selectConversation: 'Wählen Sie eine Konversation aus',
        selectConversationHint:
          'Wählen Sie einen Chat aus der Liste oder starten Sie eine neue Unterhaltung',
        emptyConversation: 'Noch keine Nachrichten',
        emptyConversationHint: 'Beginnen Sie das Gespräch, indem Sie eine Nachricht schreiben',
      },
      ChatHeader: {
        online: 'Online', //[ignorei18n]
      },
      ConversationList: {
        yesterday: 'Gestern',
        title: 'Chat', //[ignorei18n]
        searchHint: 'Konversationen suchen...',
        conversations: 'Gespräche',
        you: 'Du',
        startConversation: 'Starten Sie eine neue Konversation',
        noConversations: 'Keine Gespräche gefunden',
        searchConversations: 'Suchen Sie und beginnen Sie ein neues Gespräch',
        searchNoResults: 'Für die Suche wurden keine Ergebnisse gefunden.',
      },
      MessageInput: {
        placeholder: 'Geben Sie eine Nachricht ein...',
        sendButtonAriaLabel: 'Nachricht senden',
        emojiButtonAriaLabel: 'Wählen Sie Emoji',
      },
    },
    common: {
      AppBrand: {
        appName: 'EvenToNight', //[ignorei18n]
        altText: 'EvenToNight Logo', //[ignorei18n]
      },
    },
    contacts: {
      ContactDialog: {
        title: 'Kontaktieren Sie uns',
        nameLabel: 'Name',
        emailLabel: 'E-Mail',
        emailError: 'E-Mail ist erforderlich',
        emailFormatError: 'Bitte geben Sie eine gültige E-Mail-Adresse ein',
        subjectLabel: 'Thema',
        subjectError: 'Betreff ist erforderlich',
        messageLabel: 'Nachricht',
        messageError: 'Nachricht ist erforderlich',
        cancelLabel: 'Schließen',
        submitLabel: 'Einreichen',
      },
    },
    eventDetails: {
      EventDetailsActions: {
        downloadTickets: 'Tickets herunterladen',
        viewMyTickets: 'Meine Tickets ansehen',
        buyMoreTickets: 'Kaufen Sie weitere Tickets',
        soldOut: 'Ausverkauft',
        buyTickets: 'Kaufen Sie Tickets',
        noTicketsAvailable: 'Es sind keine Tickets zum Kauf verfügbar',
      },
      EventDetailsHeader: {
        editEvent: 'Bearbeiten',
        organizedBy: 'Organisiert von',
        likes: 'Gefällt mir',
        noLikes: 'Noch keine Likes',
        participants: 'Teilnehmer',
        noParticipants: 'Noch keine Teilnehmer',
        likeButton: 'Wie ein Ereignis',
      },
      EventInfo: {
        freePrice: 'Frei',
        startingFrom: 'Ab',
        notAvailable: 'Nicht verfügbar',
        date: 'Datum',
        time: 'Zeit',
        location: 'Standort',
        price: 'Preis',
        about: 'Über diese Veranstaltung',
        openInMaps: 'In Google Maps öffnen',
      },
      EventReviewsPreview: {
        title: 'Rezensionen',
        leaveReview: 'Hinterlassen Sie eine Bewertung',
        noReviews: 'Für diese Veranstaltung liegen noch keine Bewertungen vor',
      },
      OrganizationInfo: {
        organizedBy: 'Organisiert von',
        inCollaborationWith: 'In Zusammenarbeit mit',
      },
    },
    explore: {
      filters: {
        DateFilters: {
          today: 'Heute',
          thisWeek: 'Diese Woche',
          thisMonth: 'Diesen Monat',
          date: 'Datum',
          selectPeriod: 'Wählen Sie Zeitraum aus',
          cancel: 'Stornieren',
          apply: 'Anwenden',
        },
        FeedFilters: {
          others: 'Andere',
          upcoming: 'Demnächst',
          popular: 'Beliebt',
          nearby: 'Nahe',
          forYou: 'Für Sie',
          new: 'Neu',
        },
        FiltersButton: {
          filters: 'Filter',
          cancel: 'Klar',
          apply: 'Anwenden',
        },
        PriceFilters: {
          free: 'Frei',
          paid: 'Bezahlt',
          from: 'Aus',
          to: 'Zu',
          customize: 'Anpassen',
          price: 'Preis',
          selectPrice: 'Wählen Sie Preisspanne aus',
          minPrice: 'Mindestpreis',
          maxPrice: 'Maximaler Preis',
          cancel: 'Schließen',
          clear: 'Klar',
          apply: 'Anwenden',
        },
        SortFilters: {
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
      tabs: {
        ExploreEventsTab: {
          emptySearch: 'Keine Veranstaltungen gefunden',
          emptySearchText: 'Suchen Sie nach Ereignissen nach Namen',
        },
      },
      ExploreViewContent: {
        eventsTabTitle: 'Veranstaltungen',
        organizationsTabTitle: 'Organisationen',
        organizationEmptySearch: 'Keine Organisationen gefunden',
        organizationEmptySearchText: 'Suchen Sie nach Organisationen nach Namen',
        usersTabTitle: 'Benutzer',
        usersEmptySearch: 'Keine Benutzer gefunden',
        usersEmptySearchText: 'Suchen Sie Benutzer nach Namen',
        title: 'Erkunden',
        subtitle:
          'Finden Sie Veranstaltungen, Organisatoren oder vernetzen Sie sich mit Ihren Freunden',
      },
    },
    home: {
      CategorySelection: {
        title: 'Nach Kategorie durchsuchen',
        subtitle: 'Entdecken Sie Veranstaltungen, die Ihren Interessen entsprechen',
        categoryButtonAriaLabel: 'Kategorie anzeigen',
      },
      HomeViewContent: {
        title: 'Finden Sie die Veranstaltung für Sie',
        draftSectionTitle: 'Bearbeiten Sie Ihre Ereignisse weiter',
        upcomingEventsSectionTitle: 'Kommende Veranstaltungen',
        popularEventsSectionTitle: 'Beliebte Veranstaltungen',
        newestSectionTitle: 'Neueste Ereignisse',
      },
    },
    imageUpload: {
      AvatarCropUpload: {
        title: 'Avatar-Foto hochladen und zuschneiden',
        removeAvatar: 'Foto entfernen',
        hint: 'Laden Sie Ihr Profilfoto hoch',
      },
      BaseCropUpload: {
        title: 'Foto hochladen und zuschneiden',
        fileTooBigError: 'Die ausgewählte Datei ist zu groß. Maximale Größe ist',
        fileTypeError: 'Ungültiger Dateityp. Es sind nur Bilddateien erlaubt.',
        blobCreationError: 'Bild-Blob konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
        cropError: 'Das Bild konnte nicht zugeschnitten werden. Bitte versuchen Sie es erneut.',
        dialogCancelButton: 'Schließen',
        dialogConfirmButton: 'Speichern',
        uploadAriaLabel: 'Bild hochladen',
      },
      PosterCropUpload: {
        label: 'Veranstaltungsplakat',
        title: 'Veranstaltungsplakat hochladen und zuschneiden',
        uploadButtonLabel: 'Poster hochladen',
        dialogCancelButton: 'Schließen',
        dialogConfirmButton: 'Speichern',
      },
    },
    navigation: {
      Footer: {
        about: 'Um',
        contact: 'Kontakt',
        privacy: 'Datenschutzrichtlinie',
        terms: 'Geschäftsbedingungen',
        copyright: 'Alle Rechte vorbehalten.',
      },
      NavigationBar: {
        profile: 'Profil',
        logout: 'Abmelden',
        darkMode: 'Dunkler Modus',
        ariaLabels: {
          closeSearch: 'Suche schließen',
          search: 'Suchen',
          chat: 'Chatten',
          menu: 'Speisekarte',
          toggleTheme: 'Schalten Sie den Dunkelmodus um',
          createEvent: 'Veranstaltung erstellen',
          notifications: 'Benachrichtigungen',
        },
      },
      DrawerMenu: {
        closeDrawerAriaLabel: 'Menü schließen',
      },
      NavigationButtons: {
        backButton: 'Geh zurück',
        homeButton: 'Geh nach Hause',
      },
      SearchBar: {
        baseHint: 'Suchen...',
        searchingText: 'Suche...',
      },
    },
    notifications: {
      NotificationHandler: {
        newMessageLabel: 'Antwort',
        newLikeLabel: 'Profil anzeigen',
        newFollowLabel: 'Profil anzeigen',
        newEventCaption: 'Eine neue Veranstaltung veröffentlicht',
        newEventLabel: 'Ereignis anzeigen',
        newReviewCaption: 'Sie haben eine Bewertung zu Ihrer Veranstaltung hinterlassen',
        newReviewLabel: 'Rezension ansehen',
      },
      NotificationsButton: {
        title: 'Benachrichtigungen',
        noNotifications: 'Noch keine Benachrichtigungen',
        newEventCaption: 'Eine neue Veranstaltung veröffentlicht',
        followerReceivedCaption: 'Ich habe angefangen, dir zu folgen',
        likeReceivedCaption: 'Mir hat Ihre Veranstaltung gefallen',
        reviewReceivedCaption: 'Sie haben eine Bewertung zu Ihrer Veranstaltung hinterlassen',
      },
    },
    profile: {
      tabs: {
        MyLikesTab: {
          noLikedEvents: 'Ihnen haben noch keine Veranstaltungen gefallen',
        },
        ReviewsTab: {
          loading: 'Bewertungen werden geladen...',
          noReviews: 'Für diese Organisation liegen noch keine Bewertungen vor',
        },
      },
      ProfileActions: {
        createEvent: 'Ereignis erstellen',
        following: 'Nachfolgend',
        follow: 'Folgen',
      },
      ProfileBody: {
        myEventsExternal: 'Veranstaltungen',
        myEventsPublishedLabel: 'Kommende Veranstaltungen',
        myEventsPastEventsLabel: 'Vergangene Veranstaltungen',
        noEventCreated: 'Sie haben noch keine Veranstaltungen erstellt.',
        noEventCreatedExternal: 'Diese Organisation hat noch keine Veranstaltungen erstellt.',
        draftedEvents: 'Entwurf',
        noDraftedEvents: 'Sie haben keine geplanten Ereignisse.',
        myLikesExternal: 'Gefällt mir',
        myParticipationsExternal: 'Beteiligungen',
        myParticipationsUpcomingLabel: 'Kommende Veranstaltungen',
        myParticipationsPastLabel: 'Vergangene Veranstaltungen',
        noEventJoined: 'Sie haben noch keine Veranstaltungen besucht.',
        noEventJoinedExternal: 'Dieser Benutzer hat noch keine Veranstaltungen besucht.',
        myTickets: 'Tickets',
        reviews: 'Rezensionen',
      },
      ProfileHeader: {
        followError: 'Der Follow-Status konnte nicht aktualisiert werden',
        uploadAvatarError:
          'Das Hochladen des Avatarbildes ist fehlgeschlagen. Bitte versuchen Sie es erneut',
        profileUpdate: 'Profil erfolgreich aktualisiert!',
        userAvatarAlt: 'Benutzer-Avatar',
      },
      UserInfo: {
        followers: 'Anhänger',
        noFollowers: 'Noch keine Follower',
        following: 'Nachfolgend',
        noFollowing: 'Ich folge noch niemandem',
      },
    },
    reviews: {
      filters: {
        EventFilter: {
          allEvents: 'Alle Veranstaltungen',
          eventPosterAlt: 'Veranstaltungsplakat',
          label: 'Nach Ereignis filtern',
          noEventsFound: 'Keine Veranstaltung gefunden',
          searchHint: 'Beginnen Sie mit der Eingabe, um nach Ereignissen zu suchen',
        },
        RatingFilter: {
          allRatings: 'Alle Bewertungen',
          starLabel: 'Stern',
          starsLabel: 'Sterne',
          label: 'Nach Bewertung filtern',
        },
      },
      ratings: {
        RatingInfo: {
          noReviews: 'Keine Bewertungen',
          reviews: 'Rezensionen',
        },
      },
      ReviewsList: {
        noReviews: 'Keine Bewertungen gefunden',
      },
      ReviewsStatistics: {
        reviews: 'Rezensionen',
      },
      SubmitReviewDialog: {
        leaveReviewLabel: 'Hinterlassen Sie eine Bewertung',
        editReviewLabel: 'Bewertung bearbeiten',
        selectEventLabel: 'Wählen Sie Ereignis aus',
        selectEventError: 'Bitte wählen Sie eine Veranstaltung aus',
        eventPosterAlt: 'Veranstaltungsplakat',
        noEventsFound: 'Keine Veranstaltung gefunden',
        searchEventsHint: 'Beginnen Sie mit der Eingabe, um nach Ereignissen zu suchen',
        ratingLabel: 'Bewertung',
        reviewTitle: 'Titel',
        reviewTitlePlaceholder: 'Geben Sie Ihrer Rezension einen Titel...',
        reviewTitleError: 'Bitte geben Sie einen Titel für Ihre Bewertung ein',
        reviewDescription: 'Beschreibung',
        reviewDescriptionPlaceholder: 'Schreiben Sie Ihre Bewertung...',
        reviewDescriptionError: 'Bitte geben Sie eine Beschreibung für Ihre Bewertung ein',
        cancel: 'Schließen',
        submit: 'Einreichen',
      },
    },
    settings: {
      tabs: {
        ChangePasswordTab: {
          changePasswordTitle: 'Ändern Sie Ihr Passwort',
          changePasswordSubtitle:
            'Aktualisieren Sie Ihr Kontopasswort, um die Sicherheit Ihres Kontos zu gewährleisten.',
          passwordChangedSuccess: 'Passwort erfolgreich geändert!',
          passwordChangedError: 'Das aktuelle Passwort ist falsch. Bitte versuchen Sie es erneut',
          currentPasswordLabel: 'Aktuelles Passwort',
          currentPasswordError: 'Aktuelles Passwort ist erforderlich',
          newPasswordLabel: 'Neues Passwort',
          newPasswordError: 'Neues Passwort ist erforderlich',
          confirmPasswordLabel: 'Bestätigen Sie das neue Passwort',
          confirmPasswordError: 'Bitte bestätigen Sie Ihr neues Passwort',
          passwordMismatchError: 'Neue Passwörter stimmen nicht überein',
          changePasswordButton: 'Kennwort ändern',
        },
        GeneralSettingsTab: {
          male: 'Männlich',
          female: 'Weiblich',
          other: 'Ich ziehe es vor, keine Angaben zu machen',
          tooManyTagsWarning: 'Sie können nur bis auswählen',
          failedLoading: 'Die Einstellungen konnten nicht geladen werden',
          settingsSavedSuccess: 'Einstellungen erfolgreich gespeichert!',
          settingsSavedError:
            'Die Einstellungen konnten nicht gespeichert werden. Bitte versuchen Sie es erneut',
          deleteProfileTitle: 'Profil löschen',
          deleteProfileMessage:
            'Sind Sie sicher, dass Sie Ihr Profil löschen möchten? Diese Aktion ist unwiderruflich und entfernt alle Ihre Daten von unserer Plattform.',
          cancel: 'Zurück',
          delete: 'Löschen',
          profileDeletedSuccess: 'Ihr Profil wurde erfolgreich gelöscht.',
          profileDeletedError: 'Profil konnte nicht gelöscht werden. Bitte versuchen Sie es erneut',
          informationSectionTitle: 'Persönliche Informationen',
          birthDateLabel: 'Geburtsdatum',
          genderLabel: 'Geschlecht',
          appearanceSectionTitle: 'Aussehen',
          darkModeLabel: 'Dunkler Modus',
          interestSectionTitle: 'Interessen',
          interestsLabelStart: 'Wählen Sie bis zu',
          interestsLabelEnd: 'die Ihren Interessen entsprechen',
          selected: 'Ausgewählt',
          save: 'Speichern',
          dangerZoneTitle: 'Gefahrenzone',
          dangerZoneDescription:
            'Sobald Sie Ihr Profil gelöscht haben, gibt es kein Zurück mehr. Bitte seien Sie sicher.',
          deleteProfileButton: 'Profil löschen',
        },
        LanguageTab: {
          updateLanguageError:
            'Die Spracheinstellung konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut',
          languageTitle: 'Sprachpräferenz',
          languageSubtitle: 'Wählen Sie Ihre bevorzugte Sprache für die Bewerbung',
        },
        ReviewsTab: {
          loadReviewsError:
            'Ihre Bewertungen konnten nicht geladen werden. Bitte versuchen Sie es erneut',
          searchHint: 'Durchsuchen Sie Ihre Bewertungen...',
          noReviews: 'Sie haben noch keine Bewertungen abgegeben',
          noReviewsFound: 'Es wurden keine Bewertungen gefunden, die Ihrer Suche entsprechen',
        },
      },
    },
  },
  stores: {
    auth: {
      failedRegistration: 'Die Registrierung ist fehlgeschlagen',
    },
  },
}
