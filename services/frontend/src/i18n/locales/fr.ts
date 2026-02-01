export default {
  meta: {
    description:
      "Trouvez l'événement pour vous. Recherchez les événements à venir et découvrez des expériences incroyables.",
    keywords: 'événements, vie nocturne, concerts, fêtes, événements nocturnes',
  },

  defaults: {
    searchHint: 'Rechercher des événements, des organisations ou des utilisateurs...',
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
      ticketID: 'Identifiant du billet',
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

  date: 'Date',
  time: 'Temps',
  location: 'Emplacement',
  price: 'Prix',
  download: 'Télécharger',
  profile: 'Profil',

  users: {
    organizations: 'Organisations',
    members: 'Utilisateurs',
  },

  brand: {
    appName: 'EvenToNight', //[ignorei18n]
    logo: 'Logo',
  },

  auth: {
    login: "S'inscrire",
    register: 'Se connecter',
    logout: 'Déconnexion',
    notLoggedIn: 'Oups ! Non connecté',
    loginRequired: 'Vous devez être connecté pour effectuer cette action',
    form: {
      emailLabel: 'E-mail',
      emailError: "L'e-mail est requis",
      emailFormatError: "S'il vous plaît, mettez une adresse email valide",
      passwordLabel: 'Mot de passe',
      passwordError: 'Le mot de passe est requis',
    },
    loginForm: {
      successfulLogin: 'Connexion réussie !',
      failedLogin: 'La connexion a échoué',
      switchToRegister: "Besoin d'un compte ? Registre",
    },
    registerForm: {
      nameLabel: 'Nom',
      nameError: 'Le nom est requis',
      confirmPasswordLabel: 'Confirmez le mot de passe',
      emptyConfirmPasswordError: 'Veuillez confirmer votre mot de passe',
      passwordMismatchError: 'Les mots de passe ne correspondent pas',
      isOrganizationLabel: "Je m'inscris en tant qu'organisation",
      successfulRegistration: 'Inscription réussie !',
      failedRegistration: "L'inscription a échoué",
      switchToLogin: 'Vous avez déjà un compte ? Se connecter',
    },
  },

  cards: {
    slider: {
      seeAll: 'Tout afficher',
      scrollLeftAriaLabel: 'Faire défiler vers la gauche',
      scrollRightAriaLabel: 'Faites défiler vers la droite',
    },
    eventCard: {
      loadingPoster: 'Chargement...',
      favoriteButtonAriaLabel: 'Basculer vers les favoris',
      posterAlt: "Affiche d'événement",
      draftMissingTitle: 'Événement sans titre',
    },
    ticketCard: {
      ticket: 'Billet',
    },
  },

  event: {
    draft: 'Brouillon',
  },

  eventDetails: {
    buyTickets: 'Acheter des billets',
    about: 'À propos de cet événement',
    organizer: 'Organisé par',
    collaborators: 'En collaboration avec',
    editEvent: 'Modifier',
    freePrice: 'Gratuit',
  },

  footer: {
    about: 'À propos',
    events: 'Événements',
    contact: 'Contact',
    privacy: 'politique de confidentialité',
    terms: 'Termes et conditions',
    copyright: 'Tous droits réservés.',
  },

  search: {
    baseHint: 'Recherche...',
    searchingText: 'Recherche...',
    noResultsText: 'Aucun résultat trouvé',
  },

  userProfile: {
    editProfile: 'Modifier le profil',
    createEvent: 'Créer un événement',
    followers: 'Abonnés',
    following: 'Suivant',
    follow: 'Suivre',
    myTickets: 'Mes billets',
    myEvents: 'Mes événements',
    events: 'Événements',
    noEventCreated: "Vous n'avez encore créé aucun événement.",
    noEventCreatedExternal: "Cette organisation n'a pas encore créé d'événements.",
    noEventJoined: "Vous n'avez encore assisté à aucun événement.",
    noEventJoinedExternal: "Cet utilisateur n'a encore participé à aucun événement.",
    noTickets: 'Pas encore de billets',
    draftedEvents: 'Événements rédigés',
    noDraftedEvents: 'Vous n’avez aucun événement rédigé.',
    reviews: 'Avis',
    noReviews: "Aucun avis pour l'instant.",
    userAvatarAlt: "Avatar de l'utilisateur",
    leaveReview: 'Laisser un avis',
    selectEvent: 'Sélectionnez un événement',
    selectRating: 'Sélectionnez la note :',
    reviewTitle: 'Titre',
    reviewTitlePlaceholder: 'Donnez un titre à votre avis...',
    reviewDescription: 'Description',
    reviewDescriptionPlaceholder: 'Écrivez votre avis...',
    cancel: 'Annuler',
    submit: 'Soumettre',
    noEventFound: 'Aucun événement trouvé',
  },

  theme: {
    light_mode: 'Mode lumière',
    dark_mode: 'Mode sombre',
  },

  home: {
    hero: {
      title: "Trouvez l'événement pour vous",
    },
    sections: {
      upcomingEvents: 'Événements à venir',
    },
  },
  explore: {
    title: 'Explorer',
    subtitile: 'Trouvez des événements, des organisateurs ou connectez-vous avec vos amis',
    events: {
      title: 'Événements',
      emptySearch: 'Aucun événement trouvé',
      emptySearchText: 'Rechercher des événements par nom',
    },
    organizations: {
      title: 'Organisations',
      emptySearch: 'Aucune organisation trouvée',
      emptySearchText: 'Rechercher des organisations par nom',
    },
    users: {
      title: 'Utilisateurs',
      emptySearch: 'Aucun utilisateur trouvé',
      emptySearchText: 'Rechercher des utilisateurs par nom',
    },
  },

  filters: {
    filters: 'Filtres',
    cancel: 'Annuler',
    delete: 'Clair',
    apply: 'Appliquer',
    dateFilters: {
      date: 'Date',
      selectPeriod: 'Sélectionnez la période',
      today: "Aujourd'hui",
      thisWeek: 'Cette semaine',
      thisMonth: 'Ce mois-ci',
    },
    feedFilters: {
      others: 'Autres',
      upcoming: 'Prochain',
      popular: 'Populaire',
      nearby: 'Proche',
      forYou: 'Pour toi',
      new: 'Nouveau',
    },
    priceFilters: {
      price: 'Prix',
      selectPrice: 'Sélectionnez une fourchette de prix',
      minPrice: 'Prix ​​minimum',
      maxPrice: 'Prix ​​maximum',
      customize: 'Personnaliser',
      free: 'Gratuit',
      paid: 'Payé',
      from: 'Depuis',
      to: 'À',
    },
    sortFilters: {
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
}
