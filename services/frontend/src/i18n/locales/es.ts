export default {
  meta: {
    description:
      'Encuentra el evento para ti. Busca próximos eventos y descubre experiencias increíbles.',
    keywords: 'eventos, vida nocturna, conciertos, fiestas, eventos nocturnos',
  },

  defaults: {
    searchHint: 'Buscar eventos, organizaciones o usuarios...',
    login: 'Iniciar sesión',
    register: 'Inscribirse',
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
          addTicketButton: 'Agregar tipo de boleto',
          deleteTicketButton: 'Eliminar tipo de billete',
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
        quantityAriaLabel: 'Entrada de cantidad para',
        total: 'Total',
        ticket: 'Boleto',
        tickets: 'Entradas',
        actions: {
          cancel: 'Atrás',
          continueToPayment: 'Continuar con el pago',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'ID del billete', //[ignorei18n]
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
  components: {
    auth: {
      AuthButtons: {
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      AuthRequiredDialog: {
        title: '¡Ups! No iniciado sesión',
        message: 'Debes iniciar sesión para realizar esta acción',
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      LoginForm: {
        title: '@:defaults.login', //[ignorei18n]
        successfulLogin: '¡Inicia sesión exitosamente!',
        failedLogin: 'Nombre de usuario o contraseña incorrectos',
        switchToRegister: '¿Necesitas una cuenta? Registro',
        usernameOrEmailLabel: 'Nombre de usuario o correo electrónico',
        usernameOrEmailError: 'Se requiere nombre de usuario o correo electrónico',
        passwordLabel: 'Contraseña',
        passwordError: 'Se requiere contraseña',
        login: '@:defaults.login', //[ignorei18n]
      },
      RegisterForm: {
        title: '@:defaults.register', //[ignorei18n]
        successfulRegistration: '¡Registro exitoso!',
        failedRegistration: 'Registro fallido',
        switchToLogin: '¿Ya tienes una cuenta? Acceso',
        nameLabel: 'Nombre',
        nameError: 'El nombre es obligatorio',
        emailLabel: 'Correo electrónico',
        emailError: 'Se requiere correo electrónico',
        emailFormatError: 'Por favor, introduce una dirección de correo electrónico válida',
        passwordLabel: 'Contraseña',
        passwordError: 'Se requiere contraseña',
        passwordStrengthError:
          'La contraseña debe tener al menos 8 caracteres y contener una letra minúscula, un número y un carácter especial.', //[ignorei18n]
        confirmPasswordLabel: 'confirmar Contraseña',
        emptyConfirmPasswordError: 'Por favor confirma tu contraseña',
        passwordMismatchError: 'Las contraseñas no coinciden',
        isOrganizationLabel: 'Me estoy registrando como organización',
        register: '@:defaults.register', //[ignorei18n]
      },
    },
    buttons: {
      actionButtons: {
        BackHomeButton: {
          goToHome: 'ir a casa',
        },
        BackButton: {
          goBack: 'Volver',
        },
        HomeButton: {
          goToHome: 'ir a casa',
        },
        CloseButton: {
          close: 'Cerca',
        },
      },
      basicButtons: {
        SeeAllButton: {
          seeAll: 'Ver todo',
        },
      },
    },
    cards: {
      CardSlider: {
        scrollLeftAriaLabel: 'Desplazarse hacia la izquierda',
        scrollRightAriaLabel: 'Desplazarse hacia la derecha',
      },
      EventCard: {
        posterAlt: 'Cartel del evento',
        favoriteButtonAriaLabel: 'Alternar favorito',
        draftBadge: 'Borrador',
        cancelledBadge: 'Cancelado',
        draftMissingTitle: 'Evento sin título',
        viewEventAriaLabel: 'Ver evento:',
        editDraftAriaLabel: 'Editar borrador:',
      },
      ReviewCard: {
        deleteDialog: {
          title: 'Confirmar eliminación',
          message:
            '¿Estás seguro de que deseas eliminar esta reseña? Esta acción no se puede deshacer.',
          cancelLabel: 'Atrás',
          confirmLabel: 'Borrar',
          failedDelete: 'Se produjo algún error al intentar eliminar la reseña.',
        },
        menu: {
          edit: 'Editar',
          delete: 'Borrar',
        },
      },
      SearchResultCard: {
        eventPosterAlt: 'Cartel del evento',
        userAvatarAlt: 'Avatar de usuario',
        event: 'Evento',
        organization: 'Organización',
        member: 'Usuario',
      },
      UserInfoCard: {
        avatarAlt: 'Avatar de usuario',
      },
    },
    chat: {
      ChatArea: {
        today: 'Hoy',
        yesterday: 'Ayer',
        selectConversation: 'Seleccione una conversación',
        selectConversationHint: 'Elija un chat de la lista o inicie una nueva conversación',
        emptyConversation: 'Aún no hay mensajes',
        emptyConversationHint: 'Inicia la conversación escribiendo un mensaje.',
      },
      ChatHeader: {
        online: 'Online', //[ignorei18n]
      },
      ConversationList: {
        yesterday: 'Ayer',
        title: 'Chat', //[ignorei18n]
        searchHint: 'Buscar conversaciones...',
        conversations: 'Conversaciones',
        you: 'Tú',
        startConversation: 'Iniciar una nueva conversación',
        noConversations: 'No se encontraron conversaciones',
        searchConversations: 'Buscar e iniciar una nueva conversación',
        searchNoResults: 'No se encontraron resultados para la búsqueda.',
      },
      MessageInput: {
        placeholder: 'Escribe un mensaje...',
        sendButtonAriaLabel: 'Enviar mensaje',
        emojiButtonAriaLabel: 'Seleccione emojis',
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
        title: 'Contáctenos',
        nameLabel: 'Nombre',
        emailLabel: 'Correo electrónico',
        emailError: 'Se requiere correo electrónico',
        emailFormatError: 'Por favor, introduce una dirección de correo electrónico válida',
        subjectLabel: 'Sujeto',
        subjectError: 'Se requiere sujeto',
        messageLabel: 'Mensaje',
        messageError: 'Se requiere mensaje',
        cancelLabel: 'Cerca',
        submitLabel: 'Entregar',
      },
    },
    eventDetails: {
      EventDetailsActions: {
        downloadTickets: 'Descargar Entradas',
        viewMyTickets: 'Ver mis entradas',
        buyMoreTickets: 'Comprar más entradas',
        soldOut: 'Agotado',
        buyTickets: 'Comprar Entradas',
        noTicketsAvailable: 'No hay entradas disponibles para la compra.',
      },
      EventDetailsHeader: {
        editEvent: 'Editar',
        organizedBy: 'Organizado por',
        likes: 'Gustos',
        noLikes: 'Aún no me gusta',
        participants: 'Participantes',
        noParticipants: 'Aún no hay participantes',
        likeButton: 'Me gusta el evento',
      },
      EventInfo: {
        freePrice: 'Gratis',
        startingFrom: 'A partir de',
        notAvailable: 'No disponible',
        date: 'Fecha',
        time: 'Tiempo',
        location: 'Ubicación',
        price: 'Precio',
        about: 'Acerca de este evento',
        openInMaps: 'Abrir en Google Maps',
      },
      EventReviewsPreview: {
        title: 'Reseñas',
        leaveReview: 'Deja una reseña',
        noReviews: 'Aún no hay reseñas para este evento.',
      },
      OrganizationInfo: {
        organizedBy: 'Organizado por',
        inCollaborationWith: 'En colaboración con',
      },
    },
    explore: {
      filters: {
        DateFilters: {
          today: 'Hoy',
          thisWeek: 'Esta semana',
          thisMonth: 'este mes',
          date: 'Fecha',
          selectPeriod: 'Seleccionar periodo',
          cancel: 'Cancelar',
          apply: 'Aplicar',
        },
        FeedFilters: {
          others: 'Otros',
          upcoming: 'Próximo',
          popular: 'Popular',
          nearby: 'Cercano',
          forYou: 'Para ti',
          new: 'Nuevo',
        },
        FiltersButton: {
          filters: 'Filtros',
          cancel: 'Claro',
          apply: 'Aplicar',
        },
        PriceFilters: {
          free: 'Gratis',
          paid: 'Pagado',
          from: 'De',
          to: 'A',
          customize: 'Personalizar',
          price: 'Precio',
          selectPrice: 'Seleccionar rango de precios',
          minPrice: 'Precio Mínimo',
          maxPrice: 'Precio Máximo',
          cancel: 'Cerca',
          clear: 'Claro',
          apply: 'Aplicar',
        },
        SortFilters: {
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
      tabs: {
        ExploreEventsTab: {
          emptySearch: 'No se encontraron eventos',
          emptySearchText: 'Buscar eventos por nombre',
          resultsHeading: 'Resultados de la búsqueda',
        },
      },
      ExploreViewContent: {
        eventsTabTitle: 'Eventos',
        organizationsTabTitle: 'Organizaciones',
        organizationEmptySearch: 'No se encontraron organizaciones',
        organizationEmptySearchText: 'Buscar organizaciones por nombre',
        usersTabTitle: 'Usuarios',
        usersEmptySearch: 'No se encontraron usuarios',
        usersEmptySearchText: 'Buscar usuarios por nombre',
        title: 'Explorar',
        subtitle: 'Encuentra eventos, organizadores o conéctate con tus amigos',
      },
    },
    forms: {
      FormSelectorField: {
        noResultsText: 'No se encontraron opciones',
      },
    },
    home: {
      CategorySelection: {
        title: 'Explorar por categoría',
        subtitle: 'Descubra eventos que coincidan con sus intereses',
        categoryButtonAriaLabel: 'Ver categoría',
      },
      HomeViewContent: {
        title: 'Encuentra el evento para ti',
        draftSectionTitle: 'Continuar editando tus eventos',
        upcomingEventsSectionTitle: 'Próximos eventos',
        popularEventsSectionTitle: 'Eventos populares',
        newestSectionTitle: 'Eventos más recientes',
      },
    },
    imageUpload: {
      AvatarCropUpload: {
        title: 'Cargar y recortar foto de avatar',
        removeAvatar: 'Quitar foto',
        hint: 'Sube tu foto de perfil',
      },
      BaseCropUpload: {
        title: 'Cargar y recortar foto',
        fileTooBigError: 'El archivo seleccionado es demasiado grande. El tamaño máximo es',
        fileTypeError: 'Tipo de archivo no válido. Sólo se permiten archivos de imagen.',
        blobCreationError: 'No se pudo crear el blob de imagen. Por favor inténtalo de nuevo.',
        cropError: 'No se pudo recortar la imagen. Por favor inténtalo de nuevo.',
        dialogCancelButton: 'Cerca',
        dialogConfirmButton: 'Ahorrar',
        uploadAriaLabel: 'Subir imagen',
      },
      PosterCropUpload: {
        label: 'Cartel del evento',
        title: 'Cargar y recortar póster del evento',
        uploadButtonLabel: 'Subir cartel',
        dialogCancelButton: 'Cerca',
        dialogConfirmButton: 'Ahorrar',
      },
    },
    navigation: {
      Footer: {
        about: 'Acerca de',
        contact: 'Contacto',
        privacy: 'política de privacidad',
        terms: 'Términos y condiciones',
        copyright: 'Reservados todos los derechos.',
      },
      NavigationBar: {
        profile: 'Perfil',
        logout: 'Cerrar sesión',
        darkMode: 'Modo oscuro',
        ariaLabels: {
          closeSearch: 'Cerrar búsqueda',
          search: 'Buscar',
          chat: 'Charlar',
          menu: 'Menú',
          toggleTheme: 'Alternar modo oscuro',
          createEvent: 'Crear evento',
          notifications: 'Notificaciones',
        },
      },
      DrawerMenu: {
        closeDrawerAriaLabel: 'Cerrar menú',
      },
      NavigationButtons: {
        backButton: 'Volver',
        homeButton: 'ir a casa',
      },
      SearchBar: {
        baseHint: 'Buscar...',
        searchingText: 'Búsqueda...',
      },
    },
    notifications: {
      NotificationHandler: {
        newMessageLabel: 'Responder',
        newLikeLabel: 'Ver perfil',
        newFollowLabel: 'Ver perfil',
        newEventCaption: 'Publicado un nuevo evento',
        newEventLabel: 'Ver evento',
        newReviewCaption: 'Dejó una reseña sobre su evento',
        newReviewLabel: 'Ver reseña',
      },
      NotificationsButton: {
        title: 'Notificaciones',
        noNotifications: 'Aún no hay notificaciones',
        newEventCaption: 'Publicado un nuevo evento',
        followerReceivedCaption: 'Empecé a seguirte',
        likeReceivedCaption: 'Me gustó tu evento',
        reviewReceivedCaption: 'Dejó una reseña sobre su evento',
      },
    },
    profile: {
      tabs: {
        MyLikesTab: {
          noLikedEvents: 'Aún no te ha gustado ningún evento',
        },
        ReviewsTab: {
          loading: 'Cargando reseñas...',
          noReviews: 'Aún no hay reseñas para esta organización.',
        },
        TicketsTab: {
          noTickets: 'Aún no has comprado ninguna entrada',
        },
      },
      ProfileActions: {
        createEvent: 'Crear evento',
        following: 'Siguiente',
        follow: 'Seguir',
        editProfileAriaLabel: 'Editar perfil',
        openChatAriaLabel: 'Mensajes abiertos',
        openSettingsAriaLabel: 'Abrir configuración',
        sendMessageAriaLabel: 'enviar mensaje',
      },
      ProfileBody: {
        myEventsExternal: 'Eventos',
        myEventsPublishedLabel: 'Próximos eventos',
        myEventsPastEventsLabel: 'Eventos pasados',
        noEventCreated: 'Aún no has creado ningún evento.',
        noEventCreatedExternal: 'Esta organización aún no ha creado ningún evento.',
        draftedEvents: 'Borrador',
        noDraftedEvents: 'No tienes eventos redactados.',
        myLikesExternal: 'Gustos',
        myParticipationsExternal: 'Participaciones',
        myParticipationsUpcomingLabel: 'Próximos eventos',
        myParticipationsPastLabel: 'Eventos pasados',
        noEventJoined: 'Aún no has asistido a ningún evento.',
        noEventJoinedExternal: 'Este usuario aún no ha asistido a ningún evento.',
        myTickets: 'Entradas',
        reviews: 'Reseñas',
      },
      ProfileHeader: {
        followError: 'No se pudo actualizar el estado de seguimiento',
        uploadAvatarError: 'No se pudo cargar la imagen de avatar, inténtelo de nuevo',
        profileUpdate: '¡Perfil actualizado exitosamente!',
        userAvatarAlt: 'Avatar de usuario',
        changeAvatarAriaLabel: 'Cambiar foto de perfil',
        viewAvatarAriaLabel: 'Ver foto de perfil',
        scrollToTopAriaLabel: 'Desplazarse hasta la parte superior del perfil',
      },
      UserInfo: {
        followers: 'Seguidores',
        noFollowers: 'Aún no hay seguidores',
        following: 'Siguiente',
        noFollowing: 'No seguir a nadie todavía',
        viewFollowersAriaLabel: 'Ver seguidores',
        viewFollowingAriaLabel: 'Ver siguiente',
      },
    },
    reviews: {
      filters: {
        EventFilter: {
          allEvents: 'Todos los eventos',
          eventPosterAlt: 'Cartel del evento',
          label: 'Filtrar por evento',
          noEventsFound: 'No se encontró ningún evento',
          searchHint: 'Empiece a escribir para buscar eventos',
        },
        RatingFilter: {
          allRatings: 'Todas las calificaciones',
          starLabel: 'Estrella',
          starsLabel: 'estrellas',
          label: 'Filtrar por calificación',
        },
      },
      ratings: {
        RatingInfo: {
          noReviews: 'Sin reseñas',
          reviews: 'Reseñas',
        },
      },
      ReviewsList: {
        noReviews: 'No se encontraron reseñas',
      },
      ReviewsStatistics: {
        reviews: 'Reseñas',
      },
      SubmitReviewDialog: {
        leaveReviewLabel: 'Deja una reseña',
        editReviewLabel: 'Editar reseña',
        selectEventLabel: 'Seleccionar evento',
        selectEventError: 'Por favor seleccione un evento',
        eventPosterAlt: 'Cartel del evento',
        noEventsFound: 'No se encontró ningún evento',
        ratingLabel: 'Clasificación',
        reviewTitle: 'Título',
        reviewTitlePlaceholder: 'Ponle un título a tu reseña...',
        reviewTitleError: 'Por favor ingrese un título para su reseña',
        reviewDescription: 'Descripción',
        reviewDescriptionPlaceholder: 'Escribe tu reseña...',
        reviewDescriptionError: 'Por favor ingrese una descripción para su revisión',
        cancel: 'Cerca',
        submit: 'Entregar',
      },
    },
    settings: {
      tabs: {
        ChangePasswordTab: {
          changePasswordTitle: 'Cambia tu contraseña',
          changePasswordSubtitle: 'Actualice la contraseña de su cuenta para mantenerla segura.',
          passwordChangedSuccess: '¡La contraseña se cambió correctamente!',
          passwordChangedError: 'La contraseña actual es incorrecta, inténtalo de nuevo.',
          currentPasswordLabel: 'Contraseña actual',
          currentPasswordError: 'Se requiere contraseña actual',
          newPasswordLabel: 'Nueva contraseña',
          newPasswordError: 'Se requiere nueva contraseña',
          confirmPasswordLabel: 'Confirmar nueva contraseña',
          confirmPasswordError: 'Por favor confirma tu nueva contraseña',
          passwordMismatchError: 'Las nuevas contraseñas no coinciden',
          changePasswordButton: 'Cambiar la contraseña',
        },
        GeneralSettingsTab: {
          male: 'Masculino',
          female: 'Femenino',
          other: 'prefiero no especificar',
          tooManyTagsWarning: 'Sólo puedes seleccionar hasta',
          failedLoading: 'No se pudo cargar la configuración',
          settingsSavedSuccess: '¡La configuración se guardó correctamente!',
          settingsSavedError: 'No se pudo guardar la configuración, inténtelo de nuevo',
          deleteProfileTitle: 'Eliminar perfil',
          deleteProfileMessage:
            '¿Estás seguro de que quieres eliminar tu perfil? Esta acción es irreversible y eliminará todos sus datos de nuestra plataforma.',
          cancel: 'Atrás',
          delete: 'Borrar',
          profileDeletedSuccess: 'Su perfil ha sido eliminado exitosamente.',
          profileDeletedError: 'No se pudo eliminar el perfil, inténtelo de nuevo',
          informationSectionTitle: 'Información personal',
          birthDateLabel: 'Fecha de nacimiento',
          genderLabel: 'Género',
          appearanceSectionTitle: 'Apariencia',
          darkModeLabel: 'Modo oscuro',
          interestSectionTitle: 'Intereses',
          interestsLabelStart: 'Seleccione hasta',
          interestsLabelEnd: 'que coinciden con tus intereses',
          selected: 'Seleccionado',
          save: 'Ahorrar',
          dangerZoneTitle: 'Zona de peligro',
          dangerZoneDescription:
            'Una vez que eliminas tu perfil, no hay vuelta atrás. Por favor esté seguro.',
          deleteProfileButton: 'Eliminar perfil',
        },
        LanguageTab: {
          updateLanguageError: 'No se pudo actualizar la preferencia de idioma, inténtelo de nuevo',
          languageTitle: 'Preferencia de idioma',
          languageSubtitle: 'Elija su idioma preferido para la aplicación',
        },
        MyReviewsTab: {
          loadReviewsError: 'No se pudieron cargar tus reseñas, inténtalo de nuevo.',
          searchHint: 'Busca tus reseñas...',
          noReviews: 'Aún no has enviado ninguna reseña',
          noReviewsFound: 'No se encontraron reseñas que coincidan con su búsqueda',
        },
      },
    },
  },
  stores: {
    auth: {
      failedRegistration: 'Registro fallido',
      failedLogin: 'Nombre de usuario o contraseña incorrectos',
    },
  },
}
