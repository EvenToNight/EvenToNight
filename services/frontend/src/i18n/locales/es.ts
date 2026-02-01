export default {
  meta: {
    description:
      'Encuentra el evento para ti. Busca próximos eventos y descubre experiencias increíbles.',
    keywords: 'eventos, vida nocturna, conciertos, fiestas, eventos nocturnos',
  },

  defaults: {
    searchHint: 'Buscar eventos, organizaciones o usuarios...',
  },

  views: {
    AboutView: {
      title: 'Sobre nosotros',
      firstSectionTitle: 'Nuestra Misión',
      firstSectionContent:
        'EvenToNight nació con el objetivo de conectar personas a través de experiencias únicas. Creemos que cada evento es una oportunidad para crear recuerdos inolvidables y construir comunidades.',
      secondSectionTitle: 'Nuestra historia',
      secondSectionContent:
        'Fundada en 2025, EvenToNight ha crecido rápidamente hasta convertirse en la plataforma de referencia para descubrir y gestionar eventos. Desde el primer día hemos trabajado para que la organización y asistencia a eventos sea sencilla y accesible para todos.',
      thirdSectionTitle: 'Nuestros Valores',
      thirdSectionItems: {
        item1: 'Transparencia en las comunicaciones y transacciones',
        item2: 'La comunidad en el centro de todo lo que hacemos',
        item3: 'Innovación continua para mejorar la experiencia del usuario.',
      },
    },
    CreateEventView: {
      title: {
        new: 'Crear nuevo evento',
        edit: 'Editar evento',
      },
      form: {
        title: {
          label: 'Título del evento',
          error: 'Se requiere título',
        },
        date: {
          label: 'Fecha',
          error: 'Se requiere fecha',
        },
        time: {
          label: 'Tiempo',
          error: 'Se requiere tiempo',
        },
        description: {
          label: 'Descripción',
          error: 'Se requiere descripción',
        },
        ticketTypes: {
          sectionTitle: 'Tipos de entradas',
          type: {
            label: 'Tipo',
            error: 'Por favor seleccione un tipo de entrada',
          },
          price: {
            label: 'Precio',
            error: 'Por favor introduce un precio',
          },
          quantity: {
            label: 'Cantidad',
            error: 'Por favor ingrese una cantidad',
          },
        },
        tags: {
          label: 'Etiquetas',
        },
        collaborators: {
          label: 'Colaboradores',
          avatarAlt: 'Avatar de colaborador',
        },
        location: {
          label: 'Ubicación',
          error: 'Se requiere ubicación',
          noOptionHint: 'Escribe al menos 3 caracteres para buscar',
        },
        poster: {
          label: 'Cartel del evento',
          error: 'Se requiere cartel',
          uploadButtonLabel: 'Subir cartel',
        },
        actions: {
          cancel: 'Atrás',
          delete: 'Eliminar evento',
          saveDraft: 'Guardar borrador',
          updateDraft: 'Actualizar borrador',
          publishEvent: 'Publicar evento',
          updatePublishedEvent: 'Evento de actualización',
        },
        dialog: {
          delete: {
            title: 'Eliminar evento',
            message:
              '¿Estás seguro de que deseas eliminar este evento? Esta acción no se puede deshacer.',
            confirmButton: 'Borrar',
            cancelButton: 'Atrás',
          },
        },
        messages: {
          errors: {
            updateEventDraft: 'No se pudo actualizar el borrador del evento',
            updateEvent: 'No se pudo actualizar el evento',
            saveEventDraft: 'No se pudo guardar el borrador del evento',
            saveEvent: 'No se pudo guardar el evento',
            deleteEvent: 'No se pudo eliminar el evento',
            fetchLocations:
              'No se pudieron recuperar las ubicaciones; el servicio no está disponible temporalmente',
            imageUpload: 'No se pudo cargar la imagen, inténtalo de nuevo.',
          },
          success: {
            updateEventDraft: '¡El borrador del evento se actualizó exitosamente!',
            updateEvent: '¡Evento actualizado exitosamente!',
            saveEventDraft: '¡El borrador del evento se guardó correctamente!',
            saveEvent: '¡Evento guardado exitosamente!',
            deleteEvent: '¡Evento eliminado exitosamente!',
          },
        },
      },
      messages: {
        errors: {
          createEvent: 'No se pudo crear el evento',
          loadEvent: 'No se pudo cargar el evento',
        },
      },
    },
    EditProfileView: {
      title: 'Editar perfil',
      form: {
        name: {
          label: 'Nombre',
          placeholder: 'Introduce tu nombre',
          error: 'El nombre es obligatorio',
        },
        bio: {
          label: 'Biografía',
          placeholder: 'Ingresa tu biografía',
        },
        website: {
          label: 'Sitio web',
          placeholder: 'https://ejemplo.com',
        },
        actions: {
          save: 'Ahorrar',
          cancel: 'Atrás',
        },
        messages: {
          errors: {
            imageUpload: 'No se pudo cargar la imagen de avatar, inténtelo de nuevo',
            profileUpdate: 'No se pudo actualizar el perfil, inténtelo de nuevo',
          },
          success: {
            profileUpdate: '¡Perfil actualizado exitosamente!',
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
      navigationMessageHint: 'Haga clic para ir a casa',
      navigationMessage: 'Ir a casa',
    },
    PrivacyView: {
      title: 'política de privacidad',
      lastUpdated: 'Última actualización: 23/01/2025',
      sections: {
        firstSection: {
          title: 'Introducción',
          content:
            'En EvenToNight, estamos comprometidos a proteger su privacidad. Esta Política de Privacidad explica cómo recopilamos, usamos y salvaguardamos su información cuando utiliza nuestra plataforma.',
        },
        secondSection: {
          title: 'Información que recopilamos',
          content:
            'Recopilamos información que usted nos proporciona directamente, como cuando crea una cuenta, actualiza su perfil o compra boletos. También recopilamos información automáticamente a través de su uso de nuestros servicios, incluida información del dispositivo y datos de uso.  Todos los datos se recopilan de acuerdo con el RGPD.',
        },
        thirdSection: {
          title: 'Cómo utilizamos su información',
          content:
            'Utilizamos su información para proporcionar y mejorar nuestros servicios, comunicarnos con usted, procesar transacciones y garantizar la seguridad de nuestra plataforma. No vendemos su información personal a terceros.',
        },
        fourthSection: {
          title: 'Protección de datos',
          content:
            'Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, pérdida o alteración. Utilizamos cifrado SSL/TLS para todas las transacciones.',
        },
        fifthSection: {
          title: 'Tus derechos',
          content:
            'Usted tiene derecho a acceder a sus datos, rectificar los datos inexactos, solicitar su supresión, oponerse al tratamiento y solicitar la portabilidad de los datos. Para ejercer estos derechos, por favor póngase en contacto con nosotros.',
        },
        sixthSection: {
          title: 'Contáctenos',
          content:
            "Si tiene alguna pregunta o inquietud sobre esta Política de privacidad o nuestras prácticas de datos, contáctenos en privacidad{'@'}eventonight.com.",
        },
      },
    },
    ReviewsView: {
      reviewButtonText: 'Deja una reseña',
      buttonSeparatorText: 'o',
      modifyButtonText: 'Modifica tus reseñas',
    },
    SettingsView: {
      tabs: {
        general: {
          label: 'General',
        },
        language: {
          label: 'Idioma',
        },
        changePassword: {
          label: 'Cambiar la contraseña',
        },
        reviews: {
          label: 'Mis reseñas',
        },
      },
    },
    TermsView: {
      title: 'Términos y condiciones',
      lastUpdated: 'Última actualización: 23/01/2025',
      sections: {
        firstSection: {
          title: 'Acuerdo de términos',
          content:
            'Al utilizar EvenToNight, usted acepta estar sujeto a estos Términos y condiciones. Si no está de acuerdo con estos términos, no utilice la plataforma.',
        },
        secondSection: {
          title: 'Uso del servicio',
          content:
            'Acepta utilizar EvenToNight solo para fines legales y de acuerdo con todas las leyes aplicables. No puede cargar ningún contenido que sea ofensivo, ilegal o que infrinja los derechos de otros.',
        },
        thirdSection: {
          title: 'Cuenta de usuario',
          content:
            'Usted es responsable de la seguridad de su cuenta y contraseñas. Debe notificarnos inmediatamente de cualquier acceso no autorizado. No puede transferir su cuenta a terceros.',
        },
        fourthSection: {
          title: 'Pagos y Entradas',
          content:
            'Los pagos se procesan a través de proveedores de servicios de pago seguros. Los precios están claramente indicados antes de la compra. Una vez completada la compra, recibirás las entradas vía correo electrónico.',
        },
        fifthSection: {
          title: 'Reembolsos y Cancelaciones',
          content:
            'La política de reembolso depende del organizador del evento. En caso de cancelación del evento por parte del organizador, tienes derecho a un reembolso completo. Póngase en contacto con el soporte para solicitudes de reembolso.',
        },
        sixthSection: {
          title: 'Limitación de responsabilidad',
          content:
            'EvenToNight actúa como plataforma intermediaria entre organizadores y participantes. No somos responsables de la calidad de los eventos, cancelaciones o problemas que ocurran durante los eventos.',
        },
        seventhSection: {
          title: 'Cambios a los términos',
          content:
            'Nos reservamos el derecho de modificar estos Términos y Condiciones en cualquier momento. Los cambios entrarán en vigor inmediatamente después de su publicación. El uso continuado de la plataforma constituye la aceptación de los cambios.',
        },
      },
    },
    TicketPurchaseView: {
      messages: {
        errors: {
          load: 'No se pudieron cargar los detalles del evento',
          noTicketsSelected:
            'Por favor seleccione al menos un boleto para continuar con la compra.',
          createCheckoutSession: 'No se pudo crear la sesión de pago, inténtelo nuevamente',
        },
      },
      ticketSelection: {
        title: 'Seleccionar entradas',
        available: 'disponible',
        soldOut: 'Agotado',
        total: 'Total',
        ticket: 'Boleto',
        actions: {
          cancel: 'Atrás',
          continueToPayment: 'Continuar con el pago',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'ID del billete',
      loadingTitle: 'Verificando ticket...',
      loadingMessage: 'Espere mientras verificamos su boleto.',
      failedTitle: 'Verificación fallida',
      failedMessage:
        'Error en la verificación del billete. Por favor verifique el código del boleto e inténtelo nuevamente.',
      alreadyUsedTitle: 'Boleto ya usado',
      alreadyUsedMessage:
        'Este ticket ya ha sido verificado y utilizado. No se puede volver a utilizar.',
      successTitle: 'Boleto verificado exitosamente!',
      successMessage: 'Este billete ha sido verificado y marcado como usado.',
    },
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
    terms: 'Términos y condiciones',
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
