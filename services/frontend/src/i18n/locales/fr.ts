export default {
  meta: {
    description:
      "Trouvez l'événement pour vous. Recherchez les événements à venir et découvrez des expériences incroyables.",
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

  eventCreationForm: {
    createNewEvent: 'Créer un nouvel événement',
    editEvent: "Modifier l'événement",
    eventTitle: "Titre de l'événement",
    titleError: 'Le titre est requis',
    date: 'Date',
    dateError: 'La date est requise',
    time: 'Temps',
    timeError: 'Il faut du temps',
    description: 'Description',
    descriptionError: 'Une description est requise',
    price: 'Prix',
    priceError: 'Le prix est obligatoire',
    tags: 'Balises',
    collaborators: 'Collaborateurs',
    collaboratorAvatarAlt: 'Avatar du collaborateur',
    location: 'Emplacement',
    locationError: "L'emplacement est requis",
    eventPoster: "Affiche d'événement",
    posterError: 'Une affiche est obligatoire',
    uploadPoster: "Télécharger l'affiche",
    cancel: 'Annuler',
    deleteEvent: 'Supprimer',
    deleteEventConfirm:
      'Êtes-vous sûr de vouloir supprimer cet événement ? Cette action ne peut pas être annulée.',
    saveDraft: 'Enregistrer le brouillon',
    publishEvent: 'Publier un événement',
    updateEvent: 'Événement de mise à jour',
    locationNoOptionHint: 'Tapez au moins 3 caractères pour rechercher',
    successForEventPublication: 'Événement publié avec succès !',
    successForEventUpdate: 'Événement mis à jour avec succès !',
    successForEventDeletion: 'Événement supprimé avec succès !',
    errorForEventCreation: 'Veuillez remplir tous les champs obligatoires',
    errorForEventPublication: "Échec de la création de l'événement. Veuillez réessayer.",
    errorForEventUpdate: "Échec de la mise à jour de l'événement. Veuillez réessayer.",
    errorForEventDeletion: "Échec de la suppression de l'événement. Veuillez réessayer.",
    errorForEventLoad: "Échec du chargement de l'événement. Veuillez réessayer.",
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
