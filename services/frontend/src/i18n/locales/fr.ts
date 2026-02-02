export default {
  meta: {
    description:
      "Trouvez l'événement pour vous. Recherchez les événements à venir et découvrez des expériences incroyables.",
    keywords: 'événements, vie nocturne, concerts, fêtes, événements nocturnes',
  },

  defaults: {
    searchHint: 'Rechercher des événements, des organisations ou des utilisateurs...',
    login: 'Se connecter',
    register: "S'inscrire",
  },

  views: {
    AboutView: {
      title: 'À propos de nous',
      firstSectionTitle: 'Notre mission',
      firstSectionContent:
        'EvenToNight est né dans le but de connecter les gens à travers des expériences uniques. Nous pensons que chaque événement est une opportunité de créer des souvenirs inoubliables et de bâtir des communautés.',
      secondSectionTitle: 'Notre histoire',
      secondSectionContent:
        "Fondée en 2025, EvenToNight s'est rapidement développée pour devenir la plateforme incontournable pour découvrir et gérer des événements. Dès le premier jour, nous avons travaillé pour rendre l'organisation et la participation à des événements simples et accessibles à tous.",
      thirdSectionTitle: 'Nos valeurs',
      thirdSectionItems: {
        item1: 'Transparence dans les communications et les transactions',
        item2: 'La communauté au cœur de tout ce que nous faisons',
        item3: 'Innovation continue pour améliorer l’expérience utilisateur',
      },
    },
    CreateEventView: {
      title: {
        new: 'Créer un nouvel événement',
        edit: "Modifier l'événement",
      },
      form: {
        title: {
          label: "Titre de l'événement",
          error: 'Le titre est requis',
        },
        date: {
          label: 'Date',
          error: 'La date est requise',
        },
        time: {
          label: 'Temps',
          error: 'Il faut du temps',
        },
        description: {
          label: 'Description',
          error: 'Une description est requise',
        },
        ticketTypes: {
          sectionTitle: 'Types de billets',
          type: {
            label: 'Taper',
            error: 'Veuillez sélectionner un type de billet',
          },
          price: {
            label: 'Prix',
            error: 'Veuillez entrer un prix',
          },
          quantity: {
            label: 'Quantité',
            error: 'Veuillez entrer une quantité',
          },
        },
        tags: {
          label: 'Balises',
        },
        collaborators: {
          label: 'Collaborateurs',
          avatarAlt: 'Avatar du collaborateur',
        },
        location: {
          label: 'Emplacement',
          error: "L'emplacement est requis",
          noOptionHint: 'Tapez au moins 3 caractères pour rechercher',
        },
        poster: {
          label: "Affiche d'événement",
          error: 'Une affiche est obligatoire',
          uploadButtonLabel: "Télécharger l'affiche",
        },
        actions: {
          cancel: 'Dos',
          delete: "Supprimer l'événement",
          saveDraft: 'Enregistrer le brouillon',
          updateDraft: 'Mettre à jour le brouillon',
          publishEvent: 'Publier un événement',
          updatePublishedEvent: 'Événement de mise à jour',
        },
        dialog: {
          delete: {
            title: "Supprimer l'événement",
            message:
              'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action ne peut pas être annulée.',
            confirmButton: 'Supprimer',
            cancelButton: 'Dos',
          },
        },
        messages: {
          errors: {
            updateEventDraft: "Échec de la mise à jour du brouillon de l'événement",
            updateEvent: "Échec de la mise à jour de l'événement",
            saveEventDraft: "Échec de l'enregistrement du brouillon de l'événement",
            saveEvent: "Échec de l'enregistrement de l'événement",
            deleteEvent: "Échec de la suppression de l'événement",
            fetchLocations:
              'Échec de la récupération des emplacements, le service est temporairement indisponible',
            imageUpload: "Échec du téléchargement de l'image, veuillez réessayer",
          },
          success: {
            updateEventDraft: "Le brouillon de l'événement a été mis à jour avec succès !",
            updateEvent: 'Événement mis à jour avec succès !',
            saveEventDraft: "Le brouillon de l'événement a été enregistré avec succès !",
            saveEvent: 'Événement enregistré avec succès !',
            deleteEvent: 'Événement supprimé avec succès !',
          },
        },
      },
      messages: {
        errors: {
          createEvent: "Échec de la création de l'événement",
          loadEvent: "Échec du chargement de l'événement",
        },
      },
    },
    EditProfileView: {
      title: 'Modifier le profil',
      form: {
        name: {
          label: 'Nom',
          placeholder: 'Entrez votre nom',
          error: 'Le nom est requis',
        },
        bio: {
          label: 'Biographie',
          placeholder: 'Entrez votre biographie',
        },
        website: {
          label: 'Site web',
          placeholder: 'https://exemple.com',
        },
        actions: {
          save: 'Sauvegarder',
          cancel: 'Dos',
        },
        messages: {
          errors: {
            imageUpload: "Échec du téléchargement de l'image de l'avatar, veuillez réessayer",
            profileUpdate: 'Échec de la mise à jour du profil, veuillez réessayer',
          },
          success: {
            profileUpdate: 'Profil mis à jour avec succès !',
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
      navigationMessageHint: 'Cliquez pour rentrer à la maison',
      navigationMessage: 'Aller à la maison',
    },
    PrivacyView: {
      title: 'politique de confidentialité',
      lastUpdated: 'Dernière mise à jour : 23/01/2025',
      sections: {
        firstSection: {
          title: 'Introduction',
          content:
            'Chez EvenToNight, nous nous engageons à protéger votre vie privée. Cette politique de confidentialité explique comment nous collectons, utilisons et protégeons vos informations lorsque vous utilisez notre plateforme.',
        },
        secondSection: {
          title: 'Informations que nous collectons',
          content:
            "Nous collectons les informations que vous nous fournissez directement, par exemple lorsque vous créez un compte, mettez à jour votre profil ou achetez des billets. Nous collectons également des informations automatiquement lors de votre utilisation de nos services, y compris des informations sur l'appareil et des données d'utilisation.  Toutes les données sont collectées conformément au RGPD.",
        },
        thirdSection: {
          title: 'Comment nous utilisons vos informations',
          content:
            'Nous utilisons vos informations pour fournir et améliorer nos services, communiquer avec vous, traiter les transactions et assurer la sécurité de notre plateforme. Nous ne vendons pas vos informations personnelles à des tiers.',
        },
        fourthSection: {
          title: 'Protection des données',
          content:
            'Nous mettons en œuvre des mesures de sécurité techniques et organisationnelles pour protéger vos données personnelles contre tout accès non autorisé, perte ou altération. Nous utilisons le cryptage SSL/TLS pour toutes les transactions.',
        },
        fifthSection: {
          title: 'Vos droits',
          content:
            "Vous avez le droit d'accéder à vos données, de rectifier des données inexactes, de demander la suppression, de vous opposer au traitement et de demander la portabilité des données. Pour exercer ces droits, veuillez nous contacter.",
        },
        sixthSection: {
          title: 'Contactez-nous',
          content:
            "Si vous avez des questions ou des préoccupations concernant cette politique de confidentialité ou nos pratiques en matière de données, veuillez nous contacter à l'adresse Privacy{'@'}eventonight.com.",
        },
      },
    },
    ReviewsView: {
      reviewButtonText: 'Laisser un avis',
      buttonSeparatorText: 'ou',
      modifyButtonText: 'Modifier vos avis',
    },
    SettingsView: {
      tabs: {
        general: {
          label: 'Général',
        },
        language: {
          label: 'Langue',
        },
        changePassword: {
          label: 'Changer le mot de passe',
        },
        reviews: {
          label: 'Mes avis',
        },
      },
    },
    TermsView: {
      title: 'Termes et conditions',
      lastUpdated: 'Dernière mise à jour : 23/01/2025',
      sections: {
        firstSection: {
          title: 'Accord sur les conditions',
          content:
            "En utilisant EvenToNight, vous acceptez d'être lié par ces termes et conditions. Si vous n'acceptez pas ces conditions, veuillez ne pas utiliser la plateforme.",
        },
        secondSection: {
          title: 'Utilisation du Service',
          content:
            "Vous acceptez d'utiliser EvenToNight uniquement à des fins licites et conformément à toutes les lois applicables. Vous ne pouvez pas télécharger de contenu offensant, illégal ou portant atteinte aux droits d'autrui.",
        },
        thirdSection: {
          title: 'Compte utilisateur',
          content:
            'Vous êtes responsable de la sécurité de votre compte et de vos mots de passe. Vous devez nous informer immédiatement de tout accès non autorisé. Vous ne pouvez pas transférer votre compte à des tiers.',
        },
        fourthSection: {
          title: 'Paiements et billets',
          content:
            "Les paiements sont traités via des prestataires de services de paiement sécurisés. Les prix sont clairement indiqués avant l'achat. Une fois l'achat terminé, vous recevrez les billets par e-mail.",
        },
        fifthSection: {
          title: 'Remboursements et annulations',
          content:
            "La politique de remboursement dépend de l'organisateur de l'événement. En cas d'annulation de l'événement par l'organisateur, vous avez droit à un remboursement intégral. Contactez le support pour les demandes de remboursement.",
        },
        sixthSection: {
          title: 'Limitation de responsabilité',
          content:
            'EvenToNight agit comme une plateforme intermédiaire entre les organisateurs et les participants. Nous ne sommes pas responsables de la qualité des événements, des annulations ou des problèmes survenant lors des événements.',
        },
        seventhSection: {
          title: 'Modifications des conditions',
          content:
            "Nous nous réservons le droit de modifier les présentes Conditions Générales à tout moment. Les modifications entreront en vigueur immédiatement après leur publication. La poursuite de l'utilisation de la plateforme vaut acceptation des modifications.",
        },
      },
    },
    TicketPurchaseView: {
      messages: {
        errors: {
          load: "Échec du chargement des détails de l'événement",
          noTicketsSelected: "Veuillez sélectionner au moins un billet pour procéder à l'achat",
          createCheckoutSession:
            'Échec de la création de la session de paiement, veuillez réessayer',
        },
      },
      ticketSelection: {
        title: 'Sélectionnez les billets',
        available: 'disponible',
        soldOut: 'Épuisé',
        total: 'Total',
        ticket: 'Billet',
        actions: {
          cancel: 'Dos',
          continueToPayment: 'Continuer vers le paiement',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'Identifiant du billet', //[ignorei18n]
      loadingTitle: 'Vérification du billet...',
      loadingMessage: 'Veuillez patienter pendant que nous vérifions votre billet',
      failedTitle: 'Échec de la vérification',
      failedMessage:
        'La vérification du billet a échoué. Veuillez vérifier le code du billet et réessayer.',
      alreadyUsedTitle: 'Billet déjà utilisé',
      alreadyUsedMessage: 'Ce ticket a déjà été vérifié et utilisé. Il ne peut plus être utilisé.',
      successTitle: 'Billet vérifié avec succès !',
      successMessage: 'Ce billet a été vérifié et marqué comme utilisé.',
    },
  },
  components: {
    auth: {
      AuthButtons: {
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      AuthRequiredDialog: {
        title: 'Oups ! Non connecté',
        message: 'Vous devez être connecté pour effectuer cette action',
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      LoginForm: {
        title: '@:defaults.login', //[ignorei18n]
        successfulLogin: 'Connexion réussie !',
        failedLogin: "Nom d'utilisateur ou mot de passe incorrect",
        switchToRegister: "Besoin d'un compte ? Registre",
        usernameOrEmailLabel: "Nom d'utilisateur ou e-mail",
        usernameOrEmailError: "Le nom d'utilisateur ou l'e-mail est requis",
        passwordLabel: 'Mot de passe',
        passwordError: 'Le mot de passe est requis',
        login: '@:defaults.login', //[ignorei18n]
      },
      RegisterForm: {
        title: '@:defaults.register', //[ignorei18n]
        successfulRegistration: 'Inscription réussie !',
        failedRegistration: "L'inscription a échoué",
        switchToLogin: 'Vous avez déjà un compte ? Se connecter',
        nameLabel: 'Nom',
        nameError: 'Le nom est requis',
        emailLabel: 'E-mail',
        emailError: "L'e-mail est requis",
        emailFormatError: "S'il vous plaît, mettez une adresse email valide",
        passwordLabel: 'Mot de passe',
        passwordError: 'Le mot de passe est requis',
        confirmPasswordLabel: 'Confirmez le mot de passe',
        emptyConfirmPasswordError: 'Veuillez confirmer votre mot de passe',
        passwordMismatchError: 'Les mots de passe ne correspondent pas',
        isOrganizationLabel: "Je m'inscris en tant qu'organisation",
        register: '@:defaults.register', //[ignorei18n]
      },
    },
    buttons: {
      basicButtons: {
        SeeAllButton: {
          seeAll: 'Tout voir',
        },
      },
    },
    cards: {
      CardSlider: {
        scrollLeftAriaLabel: 'Faire défiler vers la gauche',
        scrollRightAriaLabel: 'Faites défiler vers la droite',
      },
      EventCard: {
        posterAlt: "Affiche d'événement",
        favoriteButtonAriaLabel: 'Basculer vers les favoris',
        draftBadge: 'Brouillon',
        cancelledBadge: 'Annulé',
        draftMissingTitle: 'Événement sans titre',
      },
      ReviewCard: {
        deleteDialog: {
          title: 'Confirmer la suppression',
          message:
            'Êtes-vous sûr de vouloir supprimer cet avis ? Cette action ne peut pas être annulée.',
          cancelLabel: 'Dos',
          confirmLabel: 'Supprimer',
          failedDelete: "Une erreur s'est produite lors de la tentative de suppression de l'avis",
        },
        menu: {
          edit: 'Modifier',
          delete: 'Supprimer',
        },
      },
      SearchResultCard: {
        event: 'Événement',
        organization: 'Organisation',
        member: 'Utilisateur',
      },
    },
    chat: {
      ChatArea: {
        today: "Aujourd'hui",
        yesterday: 'Hier',
        selectConversation: 'Sélectionnez une conversation',
        selectConversationHint:
          'Choisissez une discussion dans la liste ou démarrez une nouvelle conversation',
        emptyConversation: 'Pas encore de messages',
        emptyConversationHint: 'Démarrez la conversation en écrivant un message',
      },
      ChatHeader: {
        online: 'Online', //[ignorei18n]
      },
      ConversationList: {
        yesterday: 'Hier',
        title: 'Chat', //[ignorei18n]
        searchHint: 'Rechercher des conversations...',
        conversations: 'Conversations',
        you: 'Toi',
        startConversation: 'Démarrer une nouvelle conversation',
        noConversations: 'Aucune conversation trouvée',
        searchConversations: 'Rechercher et démarrer une nouvelle conversation',
        searchNoResults: 'Aucun résultat trouvé pour la recherche.',
      },
      MessageInput: {
        placeholder: 'Tapez un message...',
        sendButtonAriaLabel: 'Envoyer un message',
        emojiButtonAriaLabel: 'Sélectionnez Emoji',
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
        title: 'Contactez-nous',
        nameLabel: 'Nom',
        emailLabel: 'E-mail',
        emailError: "L'e-mail est requis",
        emailFormatError: "S'il vous plaît, mettez une adresse email valide",
        subjectLabel: 'Sujet',
        subjectError: 'Le sujet est obligatoire',
        messageLabel: 'Message',
        messageError: 'Le message est requis',
        cancelLabel: 'Fermer',
        submitLabel: 'Soumettre',
      },
    },
    eventDetails: {
      EventDetailsActions: {
        downloadTickets: 'Télécharger les billets',
        viewMyTickets: 'Voir mes billets',
        buyMoreTickets: 'Acheter plus de billets',
        soldOut: 'Épuisé',
        buyTickets: 'Acheter des billets',
        noTicketsAvailable: "Aucun billet disponible à l'achat",
      },
      EventDetailsHeader: {
        editEvent: 'Modifier',
        organizedBy: 'Organisé par',
        likes: 'Goûts',
        noLikes: 'Pas encore de likes',
        participants: 'Participants',
        noParticipants: "Aucun participant pour l'instant",
      },
      EventInfo: {
        freePrice: 'Gratuit',
        startingFrom: 'À partir de',
        notAvailable: 'Pas disponible',
        date: 'Date',
        time: 'Temps',
        location: 'Emplacement',
        price: 'Prix',
        about: 'À propos de cet événement',
      },
      EventReviewsPreview: {
        title: 'Avis',
        leaveReview: 'Laisser un avis',
        noReviews: "Aucun avis pour cet événement pour l'instant",
      },
      OrganizationInfo: {
        organizedBy: 'Organisé par',
        inCollaborationWith: 'En collaboration avec',
      },
    },
    explore: {
      filters: {
        DateFilters: {
          today: "Aujourd'hui",
          thisWeek: 'Cette semaine',
          thisMonth: 'Ce mois-ci',
          date: 'Date',
          selectPeriod: 'Sélectionnez la période',
          cancel: 'Annuler',
          apply: 'Appliquer',
        },
        FeedFilters: {
          others: 'Autres',
          upcoming: 'Prochain',
          popular: 'Populaire',
          nearby: 'Proche',
          forYou: 'Pour toi',
          new: 'Nouveau',
        },
        FiltersButton: {
          filters: 'Filtres',
          cancel: 'Clair',
          apply: 'Appliquer',
        },
        PriceFilters: {
          free: 'Gratuit',
          paid: 'Payé',
          from: 'Depuis',
          to: 'À',
          customize: 'Personnaliser',
          price: 'Prix',
          selectPrice: 'Sélectionnez une fourchette de prix',
          minPrice: 'Prix ​​minimum',
          maxPrice: 'Prix ​​maximum',
          cancel: 'Fermer',
          clear: 'Clair',
          apply: 'Appliquer',
        },
        SortFilters: {
          sort: 'Trier par',
          date_asc: 'Date ascendante',
          date_desc: 'Date décroissante',
          price_asc: 'Prix ​​croissant',
          price_desc: 'Prix ​​décroissant',
        },
        TagFilters: {
          tags: 'Balises',
        },
      },
      tabs: {
        ExploreEventsTab: {
          emptySearch: 'Aucun événement trouvé',
          emptySearchText: 'Rechercher des événements par nom',
        },
      },
      ExploreViewContent: {
        eventsTabTitle: 'Événements',
        organizationsTabTitle: 'Organisations',
        organizationEmptySearch: 'Aucune organisation trouvée',
        organizationEmptySearchText: 'Rechercher des organisations par nom',
        usersTabTitle: 'Utilisateurs',
        usersEmptySearch: 'Aucun utilisateur trouvé',
        usersEmptySearchText: 'Rechercher des utilisateurs par nom',
        title: 'Explorer',
        subtitile: 'Trouvez des événements, des organisateurs ou connectez-vous avec vos amis',
      },
    },
    home: {
      CategorySelection: {
        title: 'Explorer par catégorie',
        subtitle: 'Découvrez des événements qui correspondent à vos intérêts',
      },
      HomeViewContent: {
        title: "Trouvez l'événement pour vous",
        draftSectionTitle: 'Continuez à modifier vos événements',
        upcomingEventsSectionTitle: 'Événements à venir',
        popularEventsSectionTitle: 'Événements populaires',
        newestSectionTitle: 'Événements les plus récents',
      },
    },
    imageUpload: {
      AvatarCropUpload: {
        title: "Télécharger et recadrer la photo d'avatar",
        removeAvatar: 'Supprimer la photo',
        hint: 'Téléchargez votre photo de profil',
      },
      BaseCropUpload: {
        title: 'Télécharger et recadrer la photo',
        fileTooBigError: 'Le fichier sélectionné est trop volumineux. La taille maximale est',
        fileTypeError: 'Type de fichier invalide. Seuls les fichiers images sont autorisés.',
        blobCreationError: 'Échec de la création d’un objet blob d’image. Veuillez réessayer.',
        cropError: "Échec du recadrage de l'image. Veuillez réessayer.",
        dialogCancelButton: 'Fermer',
        dialogConfirmButton: 'Sauvegarder',
      },
      PosterCropUpload: {
        label: "Affiche d'événement",
        title: "Télécharger et recadrer l'affiche de l'événement",
        uploadButtonLabel: "Télécharger l'affiche",
        dialogCancelButton: 'Fermer',
        dialogConfirmButton: 'Sauvegarder',
      },
    },
    navigation: {
      Footer: {
        about: 'À propos',
        contact: 'Contact',
        privacy: 'politique de confidentialité',
        terms: 'Termes et conditions',
        copyright: 'Tous droits réservés.',
      },
      NavigationBar: {
        profile: 'Profil',
        logout: 'Déconnexion',
        darkMode: 'Mode sombre',
      },
      SearchBar: {
        baseHint: 'Recherche...',
        searchingText: 'Recherche...',
      },
    },
    notifications: {
      NotificationHandler: {
        newMessageLabel: 'Répondre',
        newLikeLabel: 'Voir le profil',
        newFollowLabel: 'Voir le profil',
        newEventCaption: "Publication d'un nouvel événement",
        newEventLabel: "Voir l'événement",
        newReviewCaption: 'Laisser un avis sur votre événement',
        newReviewLabel: "Voir l'avis",
      },
      NotificationsButton: {
        title: 'Notifications',
        noNotifications: "Aucune notification pour l'instant",
        newEventCaption: "Publication d'un nouvel événement",
        followerReceivedCaption: "J'ai commencé à te suivre",
        likeReceivedCaption: "J'ai aimé votre événement",
        reviewReceivedCaption: 'Laisser un avis sur votre événement',
      },
    },
    profile: {
      tabs: {
        MyLikesTab: {
          noLikedEvents: "Vous n'avez encore aimé aucun événement",
        },
        ReviewsTab: {
          loading: 'Chargement des avis...',
          noReviews: "Aucun avis pour cette organisation pour l'instant",
        },
      },
      ProfileActions: {
        createEvent: 'Créer un événement',
        following: 'Suivant',
        follow: 'Suivre',
      },
      ProfileBody: {
        myEventsExternal: 'Événements',
        myEventsPublishedLabel: 'Événements à venir',
        myEventsPastEventsLabel: 'Événements passés',
        noEventCreated: "Vous n'avez encore créé aucun événement.",
        noEventCreatedExternal: "Cette organisation n'a pas encore créé d'événements.",
        draftedEvents: 'Brouillon',
        noDraftedEvents: 'Vous n’avez aucun événement rédigé.',
        myLikesExternal: 'Goûts',
        myParticipationsExternal: 'Participation',
        myParticipationsUpcomingLabel: 'Événements à venir',
        myParticipationsPastLabel: 'Événements passés',
        noEventJoined: "Vous n'avez encore assisté à aucun événement.",
        noEventJoinedExternal: "Cet utilisateur n'a encore assisté à aucun événement.",
        myTickets: 'Billets',
        reviews: 'Avis',
      },
      ProfileHeader: {
        followError: 'Échec de la mise à jour du statut de suivi',
        uploadAvatarError: "Échec du téléchargement de l'image de l'avatar, veuillez réessayer",
        userAvatarAlt: "Avatar de l'utilisateur",
      },
      UserInfo: {
        followers: 'Abonnés',
        noFollowers: "Pas encore d'abonnés",
        following: 'Suivant',
        noFollowing: 'Je ne suis encore personne',
      },
    },
    reviews: {
      filters: {
        EventFilter: {
          allEvents: 'Tous les événements',
          eventPosterAlt: "Affiche d'événement",
          label: 'Filtrer par événement',
          noEventsFound: 'Aucun événement trouvé',
          searchHint: 'Commencez à taper pour rechercher des événements',
        },
        RatingFilter: {
          allRatings: 'Toutes les notes',
          starLabel: 'Étoile',
          starsLabel: 'Étoiles',
          label: 'Filtrer par note',
        },
      },
      rating: {
        RatingInfo: {
          noReviews: 'Aucun avis',
          reviews: 'Avis',
        },
      },
      ReviewsList: {
        noReviews: 'Aucun avis trouvé',
      },
      ReviewsStatistics: {
        reviews: 'Avis',
      },
      SubmitReviewDialog: {
        leaveReviewLabel: 'Laisser un avis',
        editReviewLabel: "Modifier l'avis",
        selectEventLabel: 'Sélectionnez un événement',
        selectEventError: 'Veuillez sélectionner un événement',
        eventPosterAlt: "Affiche d'événement",
        noEventsFound: 'Aucun événement trouvé',
        searchEventsHint: 'Commencez à taper pour rechercher des événements',
        ratingLabel: 'Notation',
        reviewTitle: 'Titre',
        reviewTitlePlaceholder: 'Donnez un titre à votre avis...',
        reviewTitleError: 'Veuillez saisir un titre pour votre avis',
        reviewDescription: 'Description',
        reviewDescriptionPlaceholder: 'Écrivez votre avis...',
        reviewDescriptionError: 'Veuillez saisir une description pour votre avis',
        cancel: 'Fermer',
        submit: 'Soumettre',
      },
    },
    settings: {
      tabs: {
        ChangePasswordTab: {
          changePasswordTitle: 'Changez votre mot de passe',
          changePasswordSubtitle:
            'Mettez à jour le mot de passe de votre compte pour assurer la sécurité de votre compte.',
          passwordChangedSuccess: 'Mot de passe modifié avec succès !',
          passwordChangedError: 'Le mot de passe actuel est incorrect, veuillez réessayer',
          currentPasswordLabel: 'Mot de passe actuel',
          currentPasswordError: 'Le mot de passe actuel est requis',
          newPasswordLabel: 'Nouveau mot de passe',
          newPasswordError: 'Un nouveau mot de passe est requis',
          confirmPasswordLabel: 'Confirmer le nouveau mot de passe',
          confirmPasswordError: 'Veuillez confirmer votre nouveau mot de passe',
          passwordMismatchError: 'Les nouveaux mots de passe ne correspondent pas',
          changePasswordButton: 'Changer le mot de passe',
        },
        GeneralSettingsTab: {
          male: 'Mâle',
          female: 'Femelle',
          other: 'je préfère ne pas préciser',
          tooManyTagsWarning: "Vous ne pouvez sélectionner que jusqu'à",
          failedLoading: 'Échec du chargement des paramètres',
          settingsSavedSuccess: 'Paramètres enregistrés avec succès !',
          settingsSavedError: "Échec de l'enregistrement des paramètres, veuillez réessayer",
          deleteProfileTitle: 'Supprimer le profil',
          deleteProfileMessage:
            'Êtes-vous sûr de vouloir supprimer votre profil ? Cette action est irréversible et supprimera toutes vos données de notre plateforme.',
          cancel: 'Dos',
          delete: 'Supprimer',
          profileDeletedSuccess: 'Votre profil a été supprimé avec succès.',
          profileDeletedError: 'Échec de la suppression du profil, veuillez réessayer',
          informationSectionTitle: 'Informations personnelles',
          birthDateLabel: 'Date de naissance',
          genderLabel: 'Genre',
          appearanceSectionTitle: 'Apparence',
          darkModeLabel: 'Mode sombre',
          interestSectionTitle: 'Intérêts',
          interestsLabelStart: "Sélectionnez jusqu'à",
          interestsLabelEnd: 'qui correspondent à vos intérêts',
          selected: 'Choisi',
          save: 'Sauvegarder',
          dangerZoneTitle: 'Zone dangereuse',
          dangerZoneDescription:
            "Une fois que vous supprimez votre profil, vous ne pouvez plus revenir en arrière. Soyez-en sûr, s'il vous plaît.",
          deleteProfileButton: 'Supprimer le profil',
        },
        LanguageTab: {
          updateLanguageError:
            'Échec de la mise à jour des préférences linguistiques, veuillez réessayer',
          languageTitle: 'Préférence linguistique',
          languageSubtitle: "Choisissez votre langue préférée pour l'application",
        },
        ReviewsTab: {
          loadReviewsError: 'Échec du chargement de vos avis, veuillez réessayer',
          searchHint: 'Recherchez vos avis...',
          noReviews: "Vous n'avez pas encore soumis d'avis",
          noReviewsFound: 'Aucun avis trouvé correspondant à votre recherche',
        },
      },
    },
  },
}
