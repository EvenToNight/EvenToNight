export default {
  meta: {
    description: 'Find the event for you. Search upcoming events and discover amazing experiences.',
    keywords: 'events, nightlife, concerts, parties, night events',
  },

  defaults: {
    searchHint: 'Search events, organizations, or users...',
    login: 'Sign In',
    register: 'Sign Up',
  },

  views: {
    AboutView: {
      title: 'About Us',
      firstSectionTitle: 'Our Mission',
      firstSectionContent:
        'EvenToNight was born with the goal of connecting people through unique experiences. We believe that every event is an opportunity to create unforgettable memories and build communities.',
      secondSectionTitle: 'Our Story',
      secondSectionContent:
        'Founded in 2025, EvenToNight has rapidly grown to become the go-to platform for discovering and managing events. From day one, we have worked to make organizing and attending events simple and accessible to everyone.',
      thirdSectionTitle: 'Our Values',
      thirdSectionItems: {
        item1: 'Transparency in communications and transactions',
        item2: 'Community at the heart of everything we do',
        item3: 'Continuous innovation to enhance user experience',
      },
    },
    CreateEventView: {
      title: {
        new: 'Create New Event',
        edit: 'Edit Event',
      },
      form: {
        title: {
          label: 'Event Title',
          error: 'Title is required',
        },
        date: {
          label: 'Date',
          error: 'Date is required',
        },
        time: {
          label: 'Time',
          error: 'Time is required',
        },
        description: {
          label: 'Description',
          error: 'Description is required',
        },
        ticketTypes: {
          sectionTitle: 'Ticket Types',
          type: {
            label: 'Type',
            error: 'Please select a ticket type',
          },
          price: {
            label: 'Price',
            error: 'Please enter a price',
          },
          quantity: {
            label: 'Quantity',
            error: 'Please enter a quantity',
          },
        },
        tags: {
          label: 'Tags',
        },
        collaborators: {
          label: 'Collaborators',
          avatarAlt: 'Collaborator Avatar',
        },
        location: {
          label: 'Location',
          error: 'Location is required',
          noOptionHint: 'Type at least 3 characters to search',
        },
        poster: {
          label: 'Event Poster',
          error: 'Poster is required',
          uploadButtonLabel: 'Upload Poster',
        },
        actions: {
          cancel: 'Back',
          delete: 'Delete Event',
          saveDraft: 'Save Draft',
          updateDraft: 'Update Draft',
          publishEvent: 'Publish Event',
          updatePublishedEvent: 'Update Event',
        },
        dialog: {
          delete: {
            title: 'Delete Event',
            message: 'Are you sure you want to delete this event? This action cannot be undone.',
            confirmButton: 'Delete',
            cancelButton: 'Back',
          },
        },
        messages: {
          errors: {
            updateEventDraft: 'Failed to update event draft',
            updateEvent: 'Failed to update event',
            saveEventDraft: 'Failed to save event draft',
            saveEvent: 'Failed to save event',
            deleteEvent: 'Failed to delete event',
            fetchLocations: 'Failed to fetch locations, service is temporarily unavailable',
            imageUpload: 'Failed to upload image, please try again',
          },
          success: {
            updateEventDraft: 'Event draft updated successfully!',
            updateEvent: 'Event updated successfully!',
            saveEventDraft: 'Event draft saved successfully!',
            saveEvent: 'Event saved successfully!',
            deleteEvent: 'Event deleted successfully!',
          },
        },
      },
      messages: {
        errors: {
          createEvent: 'Failed to create event',
          loadEvent: 'Failed to load event',
        },
      },
    },
    EditProfileView: {
      title: 'Edit Profile',
      form: {
        name: {
          label: 'Name',
          placeholder: 'Enter your name',
          error: 'Name is required',
        },
        bio: {
          label: 'Bio',
          placeholder: 'Enter your bio',
        },
        website: {
          label: 'Website',
          placeholder: 'https://example.com',
        },
        actions: {
          save: 'Save',
          cancel: 'Back',
        },
        messages: {
          errors: {
            imageUpload: 'Failed to upload avatar image, please try again',
            profileUpdate: 'Failed to update profile, please try again',
          },
          success: {
            profileUpdate: 'Profile updated successfully!',
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
      navigationMessageHint: 'Click to go Home',
      navigationMessage: 'Go to Home',
    },
    PrivacyView: {
      title: 'Privacy Policy',
      lastUpdated: 'Last updated: 23/01/2025',
      sections: {
        firstSection: {
          title: 'Introduction',
          content:
            'At EvenToNight, we are committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our platform.',
        },
        secondSection: {
          title: 'Information We Collect',
          content:
            'We collect information that you provide directly to us, such as when you create an account, update your profile, or purchase tickets. We also collect information automatically through your use of our services, including device information and usage data.  All data is collected in accordance with the GDPR.',
        },
        thirdSection: {
          title: 'How We Use Your Information',
          content:
            'We use your information to provide and improve our services, communicate with you, process transactions, and ensure the security of our platform. We do not sell your personal information to third parties.',
        },
        fourthSection: {
          title: 'Data Protection',
          content:
            'We implement technical and organizational security measures to protect your personal data from unauthorized access, loss, or alteration. We use SSL/TLS encryption for all transactions.',
        },
        fifthSection: {
          title: 'Your Rights',
          content:
            'You have the right to access your data, rectify inaccurate data, request deletion, object to processing, and request data portability. To exercise these rights, please contact us.',
        },
        sixthSection: {
          title: 'Contact Us',
          content:
            "If you have any questions or concerns about this Privacy Policy or our data practices, please contact us at privacy{'@'}eventonight.com.",
        },
      },
    },
    ReviewsView: {
      reviewButtonText: 'Leave a Review',
      buttonSeparatorText: 'or',
      modifyButtonText: 'Modify your Reviews',
    },
    SettingsView: {
      tabs: {
        general: {
          label: 'General',
        },
        language: {
          label: 'Language',
        },
        changePassword: {
          label: 'Change Password',
        },
        reviews: {
          label: 'My Reviews',
        },
      },
    },
    TermsView: {
      title: 'Terms and Conditions',
      lastUpdated: 'Last updated: 23/01/2025',
      sections: {
        firstSection: {
          title: 'Agreement to Terms',
          content:
            'By using EvenToNight, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the platform.',
        },
        secondSection: {
          title: 'Use of Service',
          content:
            'You agree to use EvenToNight only for lawful purposes and in accordance with all applicable laws. You may not upload any content that is offensive, illegal, or infringes on the rights of others.',
        },
        thirdSection: {
          title: 'User Account',
          content:
            'You are responsible for the security of your account and passwords. You must notify us immediately of any unauthorized access. You may not transfer your account to third parties.',
        },
        fourthSection: {
          title: 'Payments and Tickets',
          content:
            'Payments are processed through secure payment service providers. Prices are clearly indicated before purchase. Once the purchase is complete, you will receive the tickets via email.',
        },
        fifthSection: {
          title: 'Refunds and Cancellations',
          content:
            'The refund policy depends on the event organizer. In case of event cancellation by the organizer, you are entitled to a full refund. Contact support for refund requests.',
        },
        sixthSection: {
          title: 'Limitation of Liability',
          content:
            'EvenToNight acts as a platform intermediary between organizers and participants. We are not responsible for the quality of events, cancellations, or issues that occur during events.',
        },
        seventhSection: {
          title: 'Changes to Terms',
          content:
            'We reserve the right to modify these Terms and Conditions at any time. Changes will be effective immediately upon posting. Continued use of the platform constitutes acceptance of the changes.',
        },
      },
    },
    TicketPurchaseView: {
      messages: {
        errors: {
          load: 'Failed to load event details',
          noTicketsSelected: 'Please select at least one ticket to proceed with the purchase',
          createCheckoutSession: 'Failed to create checkout session, please try again',
        },
      },
      ticketSelection: {
        title: 'Select Tickets',
        available: 'available',
        soldOut: 'Sold out',
        total: 'Total',
        ticket: 'Ticket',
        actions: {
          cancel: 'Back',
          continueToPayment: 'Continue to Payment',
        },
      },
    },
    VerifyTicketView: {
      ticketID: 'Ticket ID',
      loadingTitle: 'Verifying Ticket...',
      loadingMessage: 'Please wait while we verify your ticket',
      failedTitle: 'Verification Failed',
      failedMessage: 'Ticket verification failed. Please check the ticket code and try again.',
      alreadyUsedTitle: 'Ticket Already Used',
      alreadyUsedMessage:
        'This ticket has already been verified and used. It cannot be used again.',
      successTitle: 'Ticket Verified Successfully!',
      successMessage: 'This ticket has been verified and marked as used.',
    },
  },
  components: {
    auth: {
      AuthButtons: {
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      AuthRequiredDialog: {
        title: 'Oops! Not logged in',
        message: 'You need to be logged in to perform this action',
        login: '@:defaults.login', //[ignorei18n]
        register: '@:defaults.register', //[ignorei18n]
      },
      LoginForm: {
        title: '@:defaults.login', //[ignorei18n]
        successfulLogin: 'Login successful!',
        failedLogin: 'Wrong username or password',
        switchToRegister: 'Need an account? Register',
        usernameOrEmailLabel: 'Username or Email',
        usernameOrEmailError: 'Username or Email is required',
        passwordLabel: 'Password',
        passwordError: 'Password is required',
        login: '@:defaults.login', //[ignorei18n]
      },
      RegisterForm: {
        title: '@:defaults.register', //[ignorei18n]
        successfulRegistration: 'Registration successful!',
        failedRegistration: 'Registration failed',
        switchToLogin: 'Already have an account? Login',
        nameLabel: 'Name',
        nameError: 'Name is required',
        emailLabel: 'Email',
        emailError: 'Email is required',
        emailFormatError: 'Please enter a valid email address',
        passwordLabel: 'Password',
        passwordError: 'Password is required',
        confirmPasswordLabel: 'Confirm Password',
        emptyConfirmPasswordError: 'Please confirm your password',
        passwordMismatchError: 'Passwords do not match',
        isOrganizationLabel: "I'm registering as an organization",
        register: '@:defaults.register', //[ignorei18n]
      },
    },
    buttons: {
      basicButtons: {
        SeeAllButton: {
          seeAll: 'See All',
        },
      },
    },
    cards: {
      CardSlider: {
        scrollLeftAriaLabel: 'Scroll Left',
        scrollRightAriaLabel: 'Scroll Right',
      },
      EventCard: {
        posterAlt: 'Event Poster',
        favoriteButtonAriaLabel: 'Toggle Favorite',
        draftBadge: 'Draft',
        cancelledBadge: 'Cancelled',
        draftMissingTitle: 'Untitled Event',
      },
      ReviewCard: {
        deleteDialog: {
          title: 'Confirm Deletion',
          message: 'Are you sure you want to delete this review? This action cannot be undone.',
          cancelLabel: 'Back',
          confirmLabel: 'Delete',
          failedDelete: 'Some error occurred while trying to delete the review',
        },
        menu: {
          edit: 'Edit',
          delete: 'Delete',
        },
      },
      SearchResultCard: {
        event: 'Event',
        organization: 'Organization',
        member: 'User',
      },
    },
    chat: {
      ChatArea: {
        today: 'Today',
        yesterday: 'Yesterday',
        selectConversation: 'Select a conversation',
        selectConversationHint: 'Choose a chat from the list or start a new conversation',
        emptyConversation: 'No messages yet',
        emptyConversationHint: 'Start the conversation by writing a message',
      },
      ChatHeader: {
        online: 'Online', //[ignorei18n]
      },
      ConversationList: {
        yesterday: 'Yesterday',
        title: 'Chat', //[ignorei18n]
        searchHint: 'Search conversations...',
        conversations: 'Conversations',
        you: 'You',
        startConversation: 'Start a new Conversation',
        noConversations: 'No conversations found',
        searchConversations: 'Search and start a new conversation',
        searchNoResults: 'No results found for the search.',
      },
      MessageInput: {
        placeholder: 'Type a message...',
        sendButtonAriaLabel: 'Send Message',
        emojiButtonAriaLabel: 'Select Emoji',
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
        title: 'Contact Us',
        nameLabel: 'Name',
        emailLabel: 'Email',
        emailError: 'Email is required',
        emailFormatError: 'Please enter a valid email address',
        subjectLabel: 'Subject',
        subjectError: 'Subject is required',
        messageLabel: 'Message',
        messageError: 'Message is required',
        cancelLabel: 'Close',
        submitLabel: 'Submit',
      },
    },
    eventDetails: {
      EventDetailsActions: {
        downloadTickets: 'Download Tickets',
        viewMyTickets: 'View My Tickets',
        buyMoreTickets: 'Buy More Tickets',
        soldOut: 'Sold Out',
        buyTickets: 'Buy Tickets',
        noTicketsAvailable: 'No tickets available for purchase',
      },
      EventDetailsHeader: {
        editEvent: 'Edit',
        organizedBy: 'Organized by',
        likes: 'Likes',
        noLikes: 'No likes yet',
        participants: 'Participants',
        noParticipants: 'No participants yet',
      },
      EventInfo: {
        freePrice: 'Free',
        startingFrom: 'Starting from',
        notAvailable: 'Not available',
        date: 'Date',
        time: 'Time',
        location: 'Location',
        price: 'Price',
        about: 'About this event',
      },
      EventReviewsPreview: {
        title: 'Reviews',
        leaveReview: 'Leave a Review',
        noReviews: 'No reviews for this event yet',
      },
      OrganizationInfo: {
        organizedBy: 'Organized by',
        inCollaborationWith: 'In collaboration with',
      },
    },
    explore: {
      filters: {
        DateFilters: {
          today: 'Today',
          thisWeek: 'This Week',
          thisMonth: 'This Month',
          date: 'Date',
          selectPeriod: 'Select Period',
          cancel: 'Cancel',
          apply: 'Apply',
        },
        FeedFilters: {
          others: 'Others',
          upcoming: 'Upcoming',
          popular: 'Popular',
          nearby: 'Nearby',
          forYou: 'For You',
          new: 'New',
        },
        FilterButton: {
          filters: 'Filters',
          cancel: 'Clear',
          apply: 'Apply',
        },
        PriceFilters: {
          free: 'Free',
          paid: 'Paid',
          from: 'From',
          to: 'To',
          customize: 'Customize',
          price: 'Price',
          selectPrice: 'Select Price Range',
          minPrice: 'Minimum Price',
          maxPrice: 'Maximum Price',
          cancel: 'Close',
          clear: 'Clear',
          apply: 'Apply',
        },
        SortFilters: {
          sort: 'Sort By',
          date_asc: 'Ascenting Date',
          date_desc: 'Descending Date',
          price_asc: 'Ascenting Price',
          price_desc: 'Descending Price',
        },
        TagFilters: {
          tags: 'Tags',
        },
      },
      tabs: {
        ExploreEventsTab: {
          emptySearch: 'No events found',
          emptySearchText: 'Search events by name',
        },
      },
      ExploreViewContent: {
        eventsTabTitle: 'Events',
        organizationsTabTitle: 'Organizations',
        organizationEmptySearch: 'No organizations found',
        organizationEmptySearchText: 'Search organizations by name',
        usersTabTitle: 'Users',
        usersEmptySearch: 'No users found',
        usersEmptySearchText: 'Search users by name',
        title: 'Explore',
        subtitile: 'Find events, organizers, or connect with your friends',
      },
    },
    home: {
      CategorySelection: {
        title: 'Explore by Category',
        subtitle: 'Discover events that match your interests',
      },
      HomeViewContent: {
        title: 'Find the event for you',
        draftSectionTitle: 'Continue editing your events',
        upcomingEventsSectionTitle: 'Upcoming Events',
      },
    },
    imageUpload: {
      AvatarCropUpload: {
        title: 'Upload and Crop Avatar Photo',
        removeAvatar: 'Remove Photo',
        hint: 'Upload your profile photo',
      },
      BaseCropUpload: {
        title: 'Upload and Crop Photo',
        fileTooBigError: 'The selected file is too large. Maximum size is',
        fileTypeError: 'Invalid file type. Only image files are allowed.',
        blobCreationError: 'Failed to create image blob. Please try again.',
        cropError: 'Failed to crop the image. Please try again.',
        dialogCancelButton: 'Close',
        dialogConfirmButton: 'Save',
      },
      PosterCropUpload: {
        label: 'Event Poster',
        title: 'Upload and Crop Event Poster',
        uploadButtonLabel: 'Upload Poster',
        dialogCancelButton: 'Close',
        dialogConfirmButton: 'Save',
      },
    },
    navigation: {
      Footer: {
        about: 'About',
        contact: 'Contact',
        privacy: 'Privacy Policy',
        terms: 'Terms and Conditions',
        copyright: 'All rights reserved.',
      },
      NavigationBar: {
        profile: 'Profile',
        logout: 'Logout',
        darkMode: 'Dark Mode',
      },
      SearchBar: {
        baseHint: 'Search...',
        searchingText: 'Searching...',
      },
    },
  },

  auth: {
    logout: 'Logout',
  },

  date: 'Date',
  time: 'Time',
  location: 'Location',
  price: 'Price',
  download: 'Download',
  profile: 'Profile',

  users: {
    organizations: 'Organizations',
    members: 'Users',
  },

  event: {
    draft: 'Draft',
  },

  search: {
    baseHint: 'Search...',
    searchingText: 'Searching...',
    noResultsText: 'No results found',
  },

  userProfile: {
    editProfile: 'Edit Profile',
    createEvent: 'Create Event',
    followers: 'Followers',
    following: 'Following',
    follow: 'Follow',
    myTickets: 'My Tickets',
    myEvents: 'My Events',
    events: 'Events',
    noEventCreated: 'You have not created any events yet.',
    noEventCreatedExternal: 'This organization has not created any events yet.',
    noEventJoined: 'You have not attended any events yet.',
    noEventJoinedExternal: 'This user has not attended any events yet.',
    noTickets: 'No tickets yet',
    draftedEvents: 'Drafted Events',
    noDraftedEvents: 'You have no drafted events.',
    reviews: 'Reviews',
    noReviews: 'No reviews yet.',
    userAvatarAlt: 'User Avatar',
    leaveReview: 'Leave a review',
    selectEvent: 'Select event',
    selectRating: 'Select rating:',
    reviewTitle: 'Title',
    reviewTitlePlaceholder: 'Give your review a title...',
    reviewDescription: 'Description',
    reviewDescriptionPlaceholder: 'Write your review...',
    cancel: 'Cancel',
    submit: 'Submit',
    noEventFound: 'No event found',
  },

  theme: {
    light_mode: 'Light Mode',
    dark_mode: 'Dark Mode',
  },
}
