export default {
  date: 'Date',
  time: 'Temps',
  location: 'Emplacement',
  price: 'Prix',
  download: 'Télécharger',
  profile: 'Profil',

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
      seeAll: 'Tout voir',
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
    about: 'À propos',
    organizer: 'Organisé par',
    collaborators: 'Collaborateurs',
    editEvent: "Modifier l'événement",
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
    userAvatarAlt: "Avatar de l'utilisateur",
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
    saveDraft: 'Enregistrer le brouillon',
    publishEvent: 'Publier un événement',
    updateEvent: 'Événement de mise à jour',
    locationNoOptionHint: 'Tapez au moins 3 caractères pour rechercher',
    errorForDraftCreation: 'Veuillez fournir au moins un titre pour le projet',
    successForEventPublication: 'Événement publié avec succès !',
    successForEventUpdate: 'Événement mis à jour avec succès !',
    errorForEventCreation: 'Veuillez remplir tous les champs obligatoires',
    errorForEventPublication: "Échec de la création de l'événement. Veuillez réessayer.",
    errorForEventUpdate: "Échec de la mise à jour de l'événement. Veuillez réessayer.",
    errorForEventLoad: "Échec du chargement de l'événement. Veuillez réessayer.",
  },

  theme: {
    light_mode: 'Mode lumière',
    dark_mode: 'Mode sombre',
  },

  home: {
    hero: {
      title: "Trouvez l'événement qui vous convient",
    },
    sections: {
      upcomingEvents: 'Événements à venir',
    },
  },
}
