export default {
  meta: {
    description:
      "Trova l'evento che fa per te. Cerca i prossimi eventi e scopri esperienze straordinarie.",
    keywords: 'eventi, movida, concerti, feste, eventi notturni',
  },

  defaults: {
    searchHint: 'Cerca eventi, organizzazioni o utenti...',
    login: 'Accedi',
    register: 'Registrati',
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
        new: 'Crea un nuovo evento',
        edit: "Modifica l'evento",
      },
      form: {
        title: {
          label: 'Titolo',
          error: 'Il titolo è obbligatorio',
        },
        date: {
          label: 'Data',
          error: 'La data è obbligatoria',
        },
        time: {
          label: 'Ora',
          error: "L'ora è obbligatoria",
        },
        description: {
          label: 'Descrizione',
          error: 'La descrizione è obbligatoria',
        },
        ticketTypes: {
          sectionTitle: 'Biglietti',
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
          addTicketButton: 'Aggiungi tipo di biglietto',
          deleteTicketButton: 'Elimina tipo di biglietto',
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
          label: 'Locandina',
          error: 'La locandina è obbligatoria',
          uploadButtonLabel: 'Carica locandina',
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
            confirmButton: 'Elimina',
            cancelButton: 'Chiudi',
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
      navigationMessageHint: 'Clicca per tornare alla home',
      navigationMessage: 'Torna alla home',
    },
    PrivacyView: {
      title: 'Politica sulla riservatezza',
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
      buttonSeparatorText: 'o',
      modifyButtonText: 'Modifica le tue recensioni',
    },
    SettingsView: {
      tabs: {
        general: {
          label: 'Generali',
        },
        language: {
          label: 'Lingua',
        },
        changePassword: {
          label: 'Cambia la password',
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
        quantityAriaLabel: 'Quantità immessa per',
        total: 'Totale',
        ticket: 'Biglietto',
        tickets: 'Biglietti',
        actions: {
          cancel: 'Indietro',
          continueToPayment: 'Procedi al pagamento',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'Ticket ID', //[ignorei18n]
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
  components: {
    auth: {
      AuthButtons: {
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      AuthRequiredDialog: {
        title: "Ops! Non hai effettuato l'accesso",
        message: "È necessario effettuare l'accesso per eseguire questa azione",
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      LoginForm: {
        title: '@:defaults.login', //[ignorei18n]
        successfulLogin: 'Accesso riuscito!',
        failedLogin: 'Nome utente o password errati',
        switchToRegister: 'Hai bisogno di un account? Registrati',
        usernameOrEmailLabel: 'Nome utente o e-mail',
        usernameOrEmailError: "È richiesto il nome utente o l'e-mail",
        passwordLabel: 'Password',
        passwordError: 'È richiesta la password',
        login: '@:defaults.login', //[ignorei18n]
      },
      RegisterForm: {
        title: '@:defaults.register', //[ignorei18n]
        successfulRegistration: 'Registrazione riuscita!',
        failedRegistration: 'La registrazione non è riuscita',
        switchToLogin: 'Hai già un account? Accedi',
        nameLabel: 'Nome',
        nameError: 'Il nome è obbligatorio',
        emailLabel: 'E-mail',
        emailError: "L'e-mail è obbligatoria",
        emailFormatError: 'Si prega di inserire un indirizzo email valido',
        passwordLabel: 'Password',
        passwordError: 'La password è obbligatoria',
        passwordStrengthError:
          'La password deve essere lunga almeno 8 caratteri e contenere una lettera minuscola, un numero e un carattere speciale (!@#$%^&*)',
        confirmPasswordLabel: 'Conferma password',
        emptyConfirmPasswordError: 'Per favore conferma la tua password',
        passwordMismatchError: 'Le password non corrispondono',
        isOrganizationLabel: 'Mi sto registrando come organizzazione',
        register: '@:defaults.register', //[ignorei18n]
      },
    },
    buttons: {
      actionButtons: {
        BackHomeButton: {
          goToHome: 'Vai a casa',
        },
        BackButton: {
          goBack: 'Torna indietro',
        },
        HomeButton: {
          goToHome: 'Vai a casa',
        },
        CloseButton: {
          close: 'Vicino',
        },
      },
      basicButtons: {
        SeeAllButton: {
          seeAll: 'Vedi tutto',
        },
      },
    },
    cards: {
      CardSlider: {
        scrollLeftAriaLabel: 'Scorri a sinistra',
        scrollRightAriaLabel: 'Scorri verso destra',
      },
      EventCard: {
        posterAlt: "Locandina dell'evento",
        favoriteButtonAriaLabel: 'Attiva/disattiva preferiti',
        draftBadge: 'Bozza',
        cancelledBadge: 'Annullato',
        draftMissingTitle: 'Evento senza titolo',
        viewEventAriaLabel: 'Visualizza evento:',
        editDraftAriaLabel: 'Modifica bozza:',
      },
      ReviewCard: {
        deleteDialog: {
          title: "Conferma l'eliminazione",
          message:
            'Sei sicuro di voler eliminare questa recensione? Questa azione non può essere annullata.',
          cancelLabel: 'Indietro',
          confirmLabel: 'Elimina',
          failedDelete: 'Si è verificato un errore durante il tentativo di eliminare la recensione',
        },
        menu: {
          edit: 'Modifica',
          delete: 'Elimina',
        },
      },
      SearchResultCard: {
        eventPosterAlt: "Locandina dell'evento",
        userAvatarAlt: "Avatar dell'utente",
        event: 'Evento',
        organization: 'Organizzazione',
        member: 'Utente',
      },
      UserInfoCard: {
        avatarAlt: "Avatar dell'utente",
      },
    },
    chat: {
      ChatArea: {
        today: 'Oggi',
        yesterday: 'Ieri',
        selectConversation: 'Seleziona una conversazione',
        selectConversationHint: "Scegli una chat dall'elenco o avvia una nuova conversazione",
        emptyConversation: 'Nessun messaggio ancora',
        emptyConversationHint: 'Inizia la conversazione scrivendo un messaggio',
      },
      ChatHeader: {
        online: 'Online', //[ignorei18n]
      },
      ConversationList: {
        yesterday: 'Ieri',
        title: 'Chat', //[ignorei18n]
        searchHint: 'Cerca conversazioni...',
        conversations: 'Conversazioni',
        you: 'Tu',
        startConversation: 'Inizia una nuova conversazione',
        noConversations: 'Nessuna conversazione trovata',
        searchConversations: 'Cerca e avvia una nuova conversazione',
        searchNoResults: 'Nessun risultato trovato per la ricerca.',
      },
      MessageInput: {
        placeholder: 'Digita un messaggio...',
        sendButtonAriaLabel: 'Invia messaggio',
        emojiButtonAriaLabel: 'Seleziona Emoji',
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
        title: 'Contattaci',
        nameLabel: 'Nome',
        emailLabel: 'E-mail',
        emailError: "L'e-mail è obbligatoria",
        emailFormatError: 'Si prega di inserire un indirizzo email valido',
        subjectLabel: 'Soggetto',
        subjectError: "L'oggetto è obbligatorio",
        messageLabel: 'Messaggio',
        messageError: 'Il messaggio è obbligatorio',
        cancelLabel: 'Chiudi',
        submitLabel: 'Invia',
      },
    },
    eventDetails: {
      EventDetailsActions: {
        downloadTickets: 'Scarica i biglietti',
        viewMyTickets: 'Visualizza i miei biglietti',
        buyMoreTickets: 'Acquista più biglietti',
        soldOut: 'Biglietti Esauriti',
        buyTickets: 'Acquista i biglietti',
        noTicketsAvailable: "Nessun biglietto disponibile per l'acquisto",
      },
      EventDetailsHeader: {
        editEvent: 'Modifica',
        organizedBy: 'Organizzato da',
        likes: 'Mi piace',
        noLikes: 'Nessun mi piace ancora',
        participants: 'Partecipanti',
        noParticipants: 'Nessun partecipante ancora',
        likeButton: 'Come evento',
      },
      EventInfo: {
        freePrice: 'Gratuito',
        startingFrom: 'A partire da',
        notAvailable: 'Non disponibile',
        date: 'Data',
        time: 'Ora',
        location: 'Posizione',
        price: 'Prezzo',
        about: 'Descrizione',
        openInMaps: 'Apri in Google Maps',
      },
      EventReviewsPreview: {
        title: 'Recensioni',
        leaveReview: 'Lascia una recensione',
        noReviews: 'Ancora nessuna recensione per questo evento',
      },
      OrganizationInfo: {
        organizedBy: 'Organizzato da',
        inCollaborationWith: 'In collaborazione con',
      },
    },
    explore: {
      filters: {
        DateFilters: {
          today: 'Oggi',
          thisWeek: 'Questa settimana',
          thisMonth: 'Questo mese',
          date: 'Data',
          selectPeriod: 'Seleziona Periodo',
          cancel: 'Cancella',
          apply: 'Applica',
        },
        FeedFilters: {
          others: 'Altri',
          upcoming: 'Prossimamente',
          popular: 'Popolari',
          nearby: 'Nelle vicinanze',
          forYou: 'Per te',
          new: 'Ultimi Aggiunti',
        },
        FiltersButton: {
          filters: 'Filtri',
          cancel: 'Cancella',
          apply: 'Applica',
        },
        PriceFilters: {
          free: 'Gratis',
          paid: 'Pagato',
          from: 'Da',
          to: 'A',
          customize: 'Personalizza',
          price: 'Prezzo',
          selectPrice: 'Seleziona fascia di prezzo',
          minPrice: 'Prezzo minimo',
          maxPrice: 'Prezzo massimo',
          cancel: 'Chiudi',
          clear: 'Cancella',
          apply: 'Applica',
        },
        SortFilters: {
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
      tabs: {
        ExploreEventsTab: {
          emptySearch: 'Nessun evento trovato',
          emptySearchText: 'Cerca eventi per nome',
          resultsHeading: 'Risultati della ricerca',
        },
      },
      ExploreViewContent: {
        eventsTabTitle: 'Eventi',
        organizationsTabTitle: 'Organizzazioni',
        organizationEmptySearch: 'Nessuna organizzazione trovata',
        organizationEmptySearchText: 'Cerca organizzazioni per nome',
        usersTabTitle: 'Utenti',
        usersEmptySearch: 'Nessun utente trovato',
        usersEmptySearchText: 'Cerca gli utenti per nome',
        title: 'Esplora',
        subtitle: 'Trova eventi, organizzatori o connettiti con i tuoi amici',
      },
    },
    forms: {
      FormSelectorField: {
        noResultsText: 'Nessuna opzione trovata',
      },
    },
    home: {
      CategorySelection: {
        title: 'Esplora per categoria',
        subtitle: 'Scopri gli eventi che corrispondono ai tuoi interessi',
        categoryButtonAriaLabel: 'Visualizza categoria',
      },
      HomeViewContent: {
        title: "Trova l'evento che fa per te",
        draftSectionTitle: 'Continua a modificare i tuoi eventi',
        upcomingEventsSectionTitle: 'Prossimi eventi',
        popularEventsSectionTitle: 'Eventi popolari',
        newestSectionTitle: 'Aggiunti di recente',
      },
    },
    imageUpload: {
      AvatarCropUpload: {
        title: "Carica e ritaglia la foto dell'avatar",
        removeAvatar: 'Rimuovi foto',
        hint: 'Carica la tua foto profilo',
      },
      BaseCropUpload: {
        title: 'Carica e ritaglia foto',
        fileTooBigError: 'Il file selezionato è troppo grande. La dimensione massima è',
        fileTypeError: 'Tipo di file non valido. Sono consentiti solo file di immagine.',
        blobCreationError: "Impossibile creare il BLOB dell'immagine. Per favore riprova.",
        cropError: "Impossibile ritagliare l'immagine. Per favore riprova.",
        dialogCancelButton: 'Chiudi',
        dialogConfirmButton: 'Salva',
        uploadAriaLabel: 'Carica immagine',
      },
      PosterCropUpload: {
        label: "Locandina dell'evento",
        title: "Carica e ritaglia la locandina dell'evento",
        uploadButtonLabel: 'Carica locandina',
        dialogCancelButton: 'Chiudi',
        dialogConfirmButton: 'Salva',
      },
    },
    navigation: {
      Footer: {
        about: 'Chi siamo',
        contact: 'Contattaci',
        privacy: 'Politica sulla riservatezza',
        terms: 'Termini e Condizioni',
        copyright: 'Tutti i diritti riservati.',
      },
      NavigationBar: {
        profile: 'Profilo',
        logout: 'Esci',
        darkMode: 'Modalità scura',
        ariaLabels: {
          closeSearch: 'Chiudi la ricerca',
          search: 'Ricerca',
          chat: 'Chiacchierata',
          menu: 'Menu',
          toggleTheme: 'Attiva/disattiva la modalità oscura',
          createEvent: 'Crea evento',
          notifications: 'Notifiche',
        },
      },
      DrawerMenu: {
        closeDrawerAriaLabel: 'Chiudi menù',
      },
      NavigationButtons: {
        backButton: 'Torna indietro',
        homeButton: 'Vai a casa',
      },
      SearchBar: {
        baseHint: 'Ricerca...',
        searchingText: 'Ricerca...',
      },
    },
    notifications: {
      NotificationHandler: {
        newMessageLabel: 'Rispondi',
        newLikeLabel: 'Vedi',
        newFollowLabel: 'Vedi',
        newEventCaption: 'Pubblicato un nuovo evento',
        newEventLabel: 'Vedi',
        newReviewCaption: 'Ha lasciato una recensione sul tuo evento',
        newReviewLabel: 'Vedi',
      },
      NotificationsButton: {
        title: 'Notifiche',
        noNotifications: 'Nessuna notifica ancora',
        newEventCaption: 'Ha pubblicato un nuovo evento',
        followerReceivedCaption: 'Ha iniziato a seguirti',
        likeReceivedCaption: 'Ha messo like al tuo evento',
        reviewReceivedCaption: 'Ha lasciato una recensione sul tuo evento',
      },
    },
    profile: {
      tabs: {
        MyLikesTab: {
          noLikedEvents: 'Non hai ancora messo like a nessun evento',
        },
        ReviewsTab: {
          loading: 'Caricamento recensioni...',
          noReviews: 'Nessuna recensione ancora per questa organizzazione',
        },
        TicketsTab: {
          noTickets: 'Non hai ancora acquistato alcun biglietto',
        },
      },
      ProfileActions: {
        createEvent: 'Crea evento',
        following: 'Segui Già',
        follow: 'Segui',
        editProfileAriaLabel: 'Modifica profilo',
        openChatAriaLabel: 'Apri i messaggi',
        openSettingsAriaLabel: 'Apri le impostazioni',
        sendMessageAriaLabel: 'Invia messaggio',
      },
      ProfileBody: {
        myEventsExternal: 'Eventi',
        myEventsPublishedLabel: 'Prossimi eventi',
        myEventsPastEventsLabel: 'Eventi passati',
        noEventCreated: 'Non hai ancora creato alcun evento.',
        noEventCreatedExternal: 'Questa organizzazione non ha ancora creato alcun evento.',
        draftedEvents: 'Bozze',
        noDraftedEvents: 'Non hai nessuna bozza.',
        myLikesExternal: 'Mi piace',
        myParticipationsExternal: 'Partecipazioni',
        myParticipationsUpcomingLabel: 'Prossimi eventi',
        myParticipationsPastLabel: 'Eventi passati',
        noEventJoined: 'Non hai ancora partecipato a nessun evento.',
        noEventJoinedExternal: 'Questo utente non ha ancora partecipato ad alcun evento.',
        myTickets: 'Biglietti',
        reviews: 'Recensioni',
      },
      ProfileHeader: {
        followError: 'Impossibile aggiornare lo stato di follow',
        uploadAvatarError: "Impossibile caricare l'immagine avatar, riprova",
        profileUpdate: 'Profilo aggiornato con successo!',
        userAvatarAlt: "Avatar dell'utente",
        changeAvatarAriaLabel: "Cambia l'immagine del profilo",
        viewAvatarAriaLabel: "Visualizza l'immagine del profilo",
        scrollToTopAriaLabel: "Scorri fino all'inizio del profilo",
      },
      UserInfo: {
        followers: 'Follower',
        noFollowers: 'Non è presente nessun follower',
        following: 'Seguiti',
        noFollowing: 'Non è presente nessun seguito',
        viewFollowersAriaLabel: 'Visualizza follower',
        viewFollowingAriaLabel: 'Visualizza di seguito',
      },
    },
    reviews: {
      filters: {
        EventFilter: {
          allEvents: 'Tutti gli eventi',
          eventPosterAlt: "Locandina dell'evento",
          label: 'Filtra per evento',
          noEventsFound: 'Nessun evento trovato',
          searchHint: 'Inizia a digitare per cercare eventi',
        },
        RatingFilter: {
          allRatings: 'Tutte le valutazioni',
          starLabel: 'Stella',
          starsLabel: 'Stelle',
          label: 'Filtra per valutazione',
        },
      },
      ratings: {
        RatingInfo: {
          noReviews: 'Nessuna recensione',
          reviews: 'Recensioni',
        },
      },
      ReviewsList: {
        noReviews: 'Nessuna recensione trovata',
      },
      ReviewsStatistics: {
        reviews: 'Recensioni',
      },
      SubmitReviewDialog: {
        leaveReviewLabel: 'Lascia una recensione',
        editReviewLabel: 'Modifica recensione',
        selectEventLabel: 'Seleziona Evento',
        selectEventError: 'Seleziona un evento',
        eventPosterAlt: "Locandina dell'evento",
        noEventsFound: 'Nessun evento trovato',
        searchEventsHint: 'Inizia a digitare per cercare eventi',
        ratingLabel: 'Valutazione',
        reviewTitle: 'Titolo',
        reviewTitlePlaceholder: 'Dai un titolo alla tua recensione...',
        reviewTitleError: 'Inserisci un titolo per la tua recensione',
        reviewDescription: 'Descrizione',
        reviewDescriptionPlaceholder: 'Scrivi la tua recensione...',
        reviewDescriptionError: 'Inserisci una descrizione per la tua recensione',
        cancel: 'Chiudi',
        submit: 'Invia',
      },
    },
    settings: {
      tabs: {
        ChangePasswordTab: {
          changePasswordTitle: 'Cambia la tua password',
          changePasswordSubtitle:
            'Aggiorna la password del tuo account per mantenere il tuo account sicuro.',
          passwordChangedSuccess: 'Password modificata con successo!',
          passwordChangedError: 'La password attuale non è corretta, riprova',
          currentPasswordLabel: 'Password attuale',
          currentPasswordError: 'È richiesta la password attuale',
          newPasswordLabel: 'Nuova password',
          newPasswordError: 'È richiesta una nuova password',
          confirmPasswordLabel: 'Conferma nuova password',
          confirmPasswordError: 'Per favore conferma la tua nuova password',
          passwordMismatchError: 'Le nuove password non corrispondono',
          changePasswordButton: 'Salva',
        },
        GeneralSettingsTab: {
          male: 'Maschio',
          female: 'Femmina',
          other: 'Preferisco non specificare',
          tooManyTagsWarning: 'Puoi selezionarne solo fino a',
          failedLoading: 'Impossibile caricare le impostazioni',
          settingsSavedSuccess: 'Impostazioni salvate con successo!',
          settingsSavedError: 'Impossibile salvare le impostazioni, riprova',
          deleteProfileTitle: 'Elimina profilo',
          deleteProfileMessage:
            'Sei sicuro di voler eliminare il tuo profilo? Questa azione è irreversibile e rimuoverà tutti i tuoi dati dalla nostra piattaforma.',
          cancel: 'Chiudi',
          delete: 'Elimina',
          profileDeletedSuccess: 'Il tuo profilo è stato eliminato con successo.',
          profileDeletedError: 'Impossibile eliminare il profilo, riprova',
          informationSectionTitle: 'Informazioni personali',
          birthDateLabel: 'Data di nascita',
          genderLabel: 'Genere',
          appearanceSectionTitle: 'Aspetto',
          darkModeLabel: 'Modalità scura',
          interestSectionTitle: 'Interessi',
          interestsLabelStart: 'Seleziona fino a',
          interestsLabelEnd: 'che corrispondono ai tuoi interessi',
          selected: 'Selezionato',
          save: 'Salva',
          dangerZoneTitle: 'Zona pericolosa',
          dangerZoneDescription:
            'Una volta eliminato il tuo profilo, non è possibile tornare indietro. Per favore sii certo.',
          deleteProfileButton: 'Elimina profilo',
        },
        LanguageTab: {
          updateLanguageError: 'Impossibile aggiornare la preferenza della lingua, riprova',
          languageTitle: 'Preferenza della lingua',
          languageSubtitle: "Scegli la lingua preferita per l'applicazione",
        },
        MyReviewsTab: {
          loadReviewsError: 'Impossibile caricare le recensioni, riprova',
          searchHint: 'Cerca le tue recensioni...',
          noReviews: 'Non hai ancora inviato alcuna recensione',
          noReviewsFound: 'Nessuna recensione trovata corrispondente alla tua ricerca',
        },
      },
    },
  },
  stores: {
    auth: {
      failedRegistration: 'La registrazione non è riuscita',
      failedLogin: 'Nome utente o password errati',
    },
  },
}
