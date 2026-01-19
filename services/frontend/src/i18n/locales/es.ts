export default {
  meta: {
    description:
      'Encuentra el evento para ti. Busca próximos eventos y descubre experiencias increíbles.',
  },
  date: 'Fecha',
  time: 'Tiempo',
  location: 'Ubicación',
  price: 'Precio',
  download: 'Descargar',
  profile: 'Perfil',

  users: {
    organizations: 'Organizaciones',
    members: 'Usuarios',
  },

  brand: {
    appName: 'EvenToNight', //[ignorei18n]
    logo: 'Logo',
  },

  auth: {
    login: 'Inscribirse',
    register: 'Iniciar sesión',
    logout: 'Cerrar sesión',
    notLoggedIn: '¡Ups! No iniciado sesión',
    loginRequired: 'Debes iniciar sesión para realizar esta acción',
    form: {
      emailLabel: 'Correo electrónico',
      emailError: 'Se requiere correo electrónico',
      emailFormatError: 'Por favor, introduce una dirección de correo electrónico válida',
      passwordLabel: 'Contraseña',
      passwordError: 'Se requiere contraseña',
    },
    loginForm: {
      successfulLogin: '¡Inicia sesión exitosamente!',
      failedLogin: 'error de inicio de sesion',
      switchToRegister: '¿Necesitas una cuenta? Registro',
    },
    registerForm: {
      nameLabel: 'Nombre',
      nameError: 'El nombre es obligatorio',
      confirmPasswordLabel: 'confirmar Contraseña',
      emptyConfirmPasswordError: 'Por favor confirma tu contraseña',
      passwordMismatchError: 'Las contraseñas no coinciden',
      isOrganizationLabel: 'Me estoy registrando como organización',
      successfulRegistration: '¡Registro exitoso!',
      failedRegistration: 'Registro fallido',
      switchToLogin: '¿Ya tienes una cuenta? Acceso',
    },
  },

  cards: {
    slider: {
      seeAll: 'Ver todo',
      scrollLeftAriaLabel: 'Desplazarse hacia la izquierda',
      scrollRightAriaLabel: 'Desplazarse hacia la derecha',
    },
    eventCard: {
      loadingPoster: 'Cargando...',
      favoriteButtonAriaLabel: 'Alternar favorito',
      posterAlt: 'Cartel del evento',
      draftMissingTitle: 'Evento sin título',
    },
    ticketCard: {
      ticket: 'Boleto',
    },
  },

  event: {
    draft: 'Borrador',
  },

  eventDetails: {
    buyTickets: 'Comprar Entradas',
    about: 'Acerca de este evento',
    organizer: 'Organizado por',
    collaborators: 'En colaboración con',
    editEvent: 'Editar',
    freePrice: 'Gratis',
  },

  footer: {
    about: 'Acerca de',
    events: 'Eventos',
    contact: 'Contacto',
    privacy: 'política de privacidad',
    copyright: 'Reservados todos los derechos.',
  },

  search: {
    baseHint: 'Buscar...',
    searchingText: 'Búsqueda...',
    noResultsText: 'No se encontraron resultados',
  },

  userProfile: {
    editProfile: 'Editar perfil',
    createEvent: 'Crear evento',
    followers: 'Seguidores',
    following: 'Siguiente',
    follow: 'Seguir',
    myTickets: 'Mis entradas',
    myEvents: 'Mis Eventos',
    events: 'Eventos',
    noEventCreated: 'Aún no has creado ningún evento.',
    noEventCreatedExternal: 'Esta organización aún no ha creado ningún evento.',
    noEventJoined: 'Aún no has asistido a ningún evento.',
    noEventJoinedExternal: 'Este usuario aún no ha asistido a ningún evento.',
    noTickets: 'Aún no hay entradas',
    draftedEvents: 'Eventos redactados',
    noDraftedEvents: 'No tienes eventos redactados.',
    reviews: 'Reseñas',
    noReviews: 'Aún no hay reseñas.',
    userAvatarAlt: 'Avatar de usuario',
    leaveReview: 'Deja una reseña',
    selectEvent: 'Seleccionar evento',
    selectRating: 'Seleccionar calificación:',
    reviewTitle: 'Título',
    reviewTitlePlaceholder: 'Ponle un título a tu reseña...',
    reviewDescription: 'Descripción',
    reviewDescriptionPlaceholder: 'Escribe tu reseña...',
    cancel: 'Cancelar',
    submit: 'Entregar',
    noEventFound: 'No se encontró ningún evento',
  },

  eventCreationForm: {
    createNewEvent: 'Crear nuevo evento',
    editEvent: 'Editar evento',
    eventTitle: 'Título del evento',
    titleError: 'Se requiere título',
    date: 'Fecha',
    dateError: 'Se requiere fecha',
    time: 'Tiempo',
    timeError: 'Se requiere tiempo',
    description: 'Descripción',
    descriptionError: 'Se requiere descripción',
    price: 'Precio',
    priceError: 'Se requiere precio',
    tags: 'Etiquetas',
    collaborators: 'Colaboradores',
    collaboratorAvatarAlt: 'Avatar de colaborador',
    location: 'Ubicación',
    locationError: 'Se requiere ubicación',
    eventPoster: 'Cartel del evento',
    posterError: 'Se requiere cartel',
    uploadPoster: 'Subir cartel',
    cancel: 'Cancelar',
    deleteEvent: 'Borrar',
    deleteEventConfirm:
      '¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.',
    saveDraft: 'Guardar borrador',
    publishEvent: 'Publicar evento',
    updateEvent: 'Evento de actualización',
    locationNoOptionHint: 'Escribe al menos 3 caracteres para buscar',
    successForEventPublication: '¡Evento publicado exitosamente!',
    successForEventUpdate: '¡Evento actualizado exitosamente!',
    successForEventDeletion: '¡Evento eliminado exitosamente!',
    errorForEventCreation: 'Por favor complete todos los campos requeridos',
    errorForEventPublication: 'No se pudo crear el evento. Por favor inténtalo de nuevo.',
    errorForEventUpdate: 'No se pudo actualizar el evento. Por favor inténtalo de nuevo.',
    errorForEventDeletion: 'No se pudo eliminar el evento. Por favor inténtalo de nuevo.',
    errorForEventLoad: 'No se pudo cargar el evento. Por favor inténtalo de nuevo.',
  },

  theme: {
    light_mode: 'Modo de luz',
    dark_mode: 'Modo oscuro',
  },

  home: {
    hero: {
      title: 'Encuentra el evento para ti',
    },
    sections: {
      upcomingEvents: 'Próximos eventos',
    },
  },
  explore: {
    title: 'Explorar',
    subtitile: 'Encuentra eventos, organizadores o conéctate con tus amigos',
    events: {
      title: 'Eventos',
      emptySearch: 'No se encontraron eventos',
      emptySearchText: 'Buscar eventos por nombre',
    },
    organizations: {
      title: 'Organizaciones',
      emptySearch: 'No se encontraron organizaciones',
      emptySearchText: 'Buscar organizaciones por nombre',
    },
    users: {
      title: 'Usuarios',
      emptySearch: 'No se encontraron usuarios',
      emptySearchText: 'Buscar usuarios por nombre',
    },
  },

  filters: {
    filters: 'Filtros',
    cancel: 'Cancelar',
    delete: 'Claro',
    apply: 'Aplicar',
    dateFilters: {
      date: 'Fecha',
      selectPeriod: 'Seleccionar periodo',
      today: 'Hoy',
      thisWeek: 'Esta semana',
      thisMonth: 'este mes',
    },
    feedFilters: {
      others: 'Otros',
      upcoming: 'Próximo',
      popular: 'Popular',
      nearby: 'Cercano',
      forYou: 'Para ti',
      new: 'Nuevo',
    },
    priceFilters: {
      price: 'Precio',
      selectPrice: 'Seleccionar rango de precios',
      minPrice: 'Precio Mínimo',
      maxPrice: 'Precio Máximo',
      customize: 'Personalizar',
      free: 'Gratis',
      paid: 'Pagado',
      from: 'De',
      to: 'A',
    },
    sortFilters: {
      sort: 'Ordenar por',
      date_asc: 'Fecha de ascenso',
      date_desc: 'Fecha descendente',
      price_asc: 'Precio ascendente',
      price_desc: 'Precio descendente',
    },
    TagFilters: {
      tags: 'Etiquetas',
    },
  },
}
