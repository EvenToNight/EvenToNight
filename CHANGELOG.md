## [1.20.1](https://github.com/EvenToNight/EvenToNight/compare/v1.20.0...v1.20.1) (2026-01-21)

### Bug Fixes

* **autologin:** fix role setup in register ([f49ac6f](https://github.com/EvenToNight/EvenToNight/commit/f49ac6fbe569f291cf7f694803c77de23858b67a))
* **avatar:** fix avatar refresh ([57deb25](https://github.com/EvenToNight/EvenToNight/commit/57deb2567407d364160526f1092635f8801236e0))
* **chat:** fix mocked chat conversation handling ([bf1bb2d](https://github.com/EvenToNight/EvenToNight/commit/bf1bb2d417f15315cac27a3c5107368ae035d158))
* **chat:** fix mocked conversation search ([3ab7b6a](https://github.com/EvenToNight/EvenToNight/commit/3ab7b6abc043298e4638a230954f71e5162654cc))
* **chat:** fix total count update in mocked readConversationMessages ([e5a5d84](https://github.com/EvenToNight/EvenToNight/commit/e5a5d849668278232b640bffeddb4ba6952f4999))
* **chat:** leave sidebar open when click search on mobile ([9797e4c](https://github.com/EvenToNight/EvenToNight/commit/9797e4c2d730396f3b78e8e5ebce6d46e34b3975))
* **editProfile:** fix form validation ([2a56b6e](https://github.com/EvenToNight/EvenToNight/commit/2a56b6e6cb9bb6ce58156e4dd38eb665730ff0c7))
* **gateway:** specify docker network to watch for discover services ([4066eb7](https://github.com/EvenToNight/EvenToNight/commit/4066eb7133e80f2c46b0620e98290bed026703f8))
* **home:** fix dark mode background ([d6acea1](https://github.com/EvenToNight/EvenToNight/commit/d6acea1130356c1dae1c2b92787ce07b32ba681b))
* **users:** adapt search api to standard paginatedResponse ([6dba81a](https://github.com/EvenToNight/EvenToNight/commit/6dba81a07bdae275fe0bf5f0bf5969ee5db3b11c))
* **users:** change http method for passsword update ([16de72a](https://github.com/EvenToNight/EvenToNight/commit/16de72aa0643d3b334cf7193587b3041031ed8b6))
* **users:** check if profile foto has been changed before upload new one ([aafb964](https://github.com/EvenToNight/EvenToNight/commit/aafb9644ab8cb7e14e7eecd0acaa82fbbc85dda7))
* **users:** fix mediaServiceClient impl and getAllUsers ([904444b](https://github.com/EvenToNight/EvenToNight/commit/904444b4e25acd0328c6a860b23dbb9afbb36de6))

## [1.20.0](https://github.com/EvenToNight/EvenToNight/compare/v1.19.0...v1.20.0) (2026-01-21)

### Features

* **user-check:** implement existence check of user in interaction service ([564d74d](https://github.com/EvenToNight/EvenToNight/commit/564d74dc17ea99f701872987e95d387cb60e6ac0))
* **user-participations:** update response to user participations request ([d6fcaf4](https://github.com/EvenToNight/EvenToNight/commit/d6fcaf49b92ec6c3efb98b061a86c30d9a51fd7d))

## [1.19.0](https://github.com/EvenToNight/EvenToNight/compare/v1.18.0...v1.19.0) (2026-01-20)

### Features

* **users:** GET /{userId} returns full account/profile if token userId matches ([61a9fe9](https://github.com/EvenToNight/EvenToNight/commit/61a9fe9385278c53da9e0add51cca6807616bc64))
* **users:** implement delete /:userId endpoint ([f5b1353](https://github.com/EvenToNight/EvenToNight/commit/f5b13532c2a7c4b2619f4e525504db9b977bf562))
* **users:** implement POST /{userId} endpoint to update avatar and add OpenAPI spec ([6b0d14d](https://github.com/EvenToNight/EvenToNight/commit/6b0d14d5e908dc6846e8cd6ac13361753e63326b))
* **users:** implement PUT /{userId} endpoint and add OpenAPI spec ([b7da510](https://github.com/EvenToNight/EvenToNight/commit/b7da5100fa88c2745f18150749208ce0b33f98f5))
* **users:** implement PUT /{userId}/password and add OpenAPI spec ([0710c21](https://github.com/EvenToNight/EvenToNight/commit/0710c21eacbdafc658c1b1f2561877b0a522f0f5))
* **users:** implement search endpoint with pagination and filters ([d182ed1](https://github.com/EvenToNight/EvenToNight/commit/d182ed15dd8b1233ad15ce910a4576d64c4343c8))

## [1.18.0](https://github.com/EvenToNight/EvenToNight/compare/v1.17.1...v1.18.0) (2026-01-19)

### Features

* **auth:** add authentication layer setup ([f6aae72](https://github.com/EvenToNight/EvenToNight/commit/f6aae72690e86ca297f88bd274a7244395ee5650))
* **checkout:** integarte stripe for checkout session and update testing modes ([8b3fc63](https://github.com/EvenToNight/EvenToNight/commit/8b3fc63ef290dc03d4ac92262933c9024fc0f03b))
* **domain-data:** save event and user data ([b0f191c](https://github.com/EvenToNight/EvenToNight/commit/b0f191c3d932fd106f1e7a60523f486083fc18b3))
* **event:** publish payments.order.confirmed and payments.order.rejected events ([bfe4639](https://github.com/EvenToNight/EvenToNight/commit/bfe4639848b5ec344ce8edf2cb970c289f4ab30c))
* **eventTicketType:** handle event ticketTypes deletion ([9cff6f2](https://github.com/EvenToNight/EvenToNight/commit/9cff6f23e49144d16a876fafdc4947c92386dedf))
* **eventTicketType:** handle single ticket type  deletion ([d24835d](https://github.com/EvenToNight/EvenToNight/commit/d24835dd74f6ff9c10be65bd7d7bb3486fdec8d3))
* **ticket:** add ticket to pdf service ([2c170f8](https://github.com/EvenToNight/EvenToNight/commit/2c170f8c50abae6cc25f8eafa7af762f6e1e144f))
* **ticket:** suport multiple ticket languages ([c19fdd5](https://github.com/EvenToNight/EvenToNight/commit/c19fdd5f66e0c601a0e86d9bee91ad9270b43525))
* **ticket:** wire event-ticket-type API ([0491e4a](https://github.com/EvenToNight/EvenToNight/commit/0491e4a3d85ddf16fb462b605334f7b71a64607d))
* **transactionManager:** add retry logic ([7bb4979](https://github.com/EvenToNight/EvenToNight/commit/7bb4979f40eeefa4b7f6663759c583560a08b749))
* **user:** handle user messages reception ([74a2f73](https://github.com/EvenToNight/EvenToNight/commit/74a2f731a6ac1f72724bd0f55f9a6b753299867d))

### Bug Fixes

* **checkout:** react to correct event ([d341999](https://github.com/EvenToNight/EvenToNight/commit/d34199941619cde607f4c53bb48e3934c342cd5b))
* **event-ticket:** avoid duplicate ticket type for same event ([be3d862](https://github.com/EvenToNight/EvenToNight/commit/be3d8621028ee34d87275a87a4dd5e71ac0442c7))
* **locale:** fix local selection from footer ([abea457](https://github.com/EvenToNight/EvenToNight/commit/abea4577eabed719edc2cc6e1baec672506a510d))
* **setupApp:** update command to keep stripe listener alive ([0ad8b6c](https://github.com/EvenToNight/EvenToNight/commit/0ad8b6c65c7dd21a5d5be31c7bbf0f69f7d941e1))
* **tickets:** check for event creator to mark ticket as USED ([3f61a3f](https://github.com/EvenToNight/EvenToNight/commit/3f61a3f7641882794c546b084b02258824e4df57))
* **transaction:** add readPreference ([e86a0ce](https://github.com/EvenToNight/EvenToNight/commit/e86a0ceb0445202e397633f54931433da0a48e27))

## [1.17.1](https://github.com/EvenToNight/EvenToNight/compare/v1.17.0...v1.17.1) (2026-01-16)

### Bug Fixes

* **media-service:** add healthcheck in media service ([d617a19](https://github.com/EvenToNight/EvenToNight/commit/d617a194a4861661e0a4050f726340b6f0196fd3))

## [1.17.0](https://github.com/EvenToNight/EvenToNight/compare/v1.16.0...v1.17.0) (2026-01-15)

### Features

* **message:** send user.created  message on user registration ([5ccce7e](https://github.com/EvenToNight/EvenToNight/commit/5ccce7e633f87469e989db06c23cff3f49af0ae9))
* **users:** add Keycloak JWKS caching and implement /publicKeys endpoint ([bf5c2ec](https://github.com/EvenToNight/EvenToNight/commit/bf5c2ec4bae8e42938e557b48b07bdd40f6ac3b2))
* **users:** implement /logout endpoint ([ed66fca](https://github.com/EvenToNight/EvenToNight/commit/ed66fca548adf07011a55c607ba3567d85a8c78e))
* **users:** implement /refresh endpoint ([adc49d4](https://github.com/EvenToNight/EvenToNight/commit/adc49d41f6b819498b4b818a43b5b20cad8b8587))

### Bug Fixes

* **media-service:** fix bug in media service ([77f0573](https://github.com/EvenToNight/EvenToNight/commit/77f05734607373dd60e41e5ecf7a658048396685))

## [1.16.0](https://github.com/EvenToNight/EvenToNight/compare/v1.15.0...v1.16.0) (2026-01-14)

### Features

* **conversation-by-users:** provide api in controller for get conversation between two users ([c9c28bc](https://github.com/EvenToNight/EvenToNight/commit/c9c28bcc61ff4c7a8ca17f8b36fe002eae0a6643))
* **messages-by-users:** provide api for get messages conversation between two users ([153d596](https://github.com/EvenToNight/EvenToNight/commit/153d596ef7aa99d5021e3d396270296e554196c3))
* **participant-name:** add userName in participant model ([6d7479f](https://github.com/EvenToNight/EvenToNight/commit/6d7479f728fe287a816cffa704edfea83568bae8))
* **search-conversation:** provide api for searching conversations ([b6074ae](https://github.com/EvenToNight/EvenToNight/commit/b6074ae2bf6868fef940d33172d217d3c82dcad0))
* **search-conversation:** search also returns users with whom you can start a conversation ([e7cd8e1](https://github.com/EvenToNight/EvenToNight/commit/e7cd8e151f440746096bd447e71c661cc1fbea36))

### Bug Fixes

* **chat-service:** fix minor bugs after copilot review ([f5818cb](https://github.com/EvenToNight/EvenToNight/commit/f5818cb0e518dcd6d10f4aa43e1469fc3fc522ec))

## [1.15.0](https://github.com/EvenToNight/EvenToNight/compare/v1.14.0...v1.15.0) (2026-01-10)

### Features

* **settings:** add change password tab ([71582d4](https://github.com/EvenToNight/EvenToNight/commit/71582d4fa40ea469cfb97c2b2dd67ce81a5d2ed4))
* **settings:** add preferred language selection ([d167876](https://github.com/EvenToNight/EvenToNight/commit/d167876fe86061ec93269e51086d9effbc0bce23))
* **support-chat:** add buttons in profile to use support-chat ([84af718](https://github.com/EvenToNight/EvenToNight/commit/84af718b9bf5f94f9c9112cd6f7fe4f9d89e7b41))
* **support-chat:** implement mocked socket using localstorage and broadcast channel ([27b6a59](https://github.com/EvenToNight/EvenToNight/commit/27b6a5923b39c47d5d586571cce9d43ab1768dd4))

### Bug Fixes

* **DrawerMenu:** fix opening anchor point ([ebdb6ef](https://github.com/EvenToNight/EvenToNight/commit/ebdb6efd9371577ebef56545c6834e3d8a54a290))
* **layout:** fix content height of TwoColumnLayout ([969b658](https://github.com/EvenToNight/EvenToNight/commit/969b658a1f2bd95ad2ab6bf23b46e3689c7086cc))
* **users-service:** add USERS_SERVICE_SECRET for dev and fix mongo-users-express network ([51e2c9e](https://github.com/EvenToNight/EvenToNight/commit/51e2c9eb30cb53b340a0ff378198a276add00687))

## [1.14.0](https://github.com/EvenToNight/EvenToNight/compare/v1.13.0...v1.14.0) (2026-01-10)

### Features

* **conversation-by-id:** provide api in controller to get single conversation by id ([3e7ce09](https://github.com/EvenToNight/EvenToNight/commit/3e7ce099a255b0da7176b76361af6ae493606ee2))
* **conversation-messages:** provide api in controller to retrieve messages of a conversation ([1cc1018](https://github.com/EvenToNight/EvenToNight/commit/1cc1018eedebeba1aa2cba17c76390c6c67225b8))
* **create-conversation:** change api for create new conversation ([25f12fd](https://github.com/EvenToNight/EvenToNight/commit/25f12fd76adc3d7f63cad6c2571300f59b986c90))
* **read-message:** provide api in controller for reading message ([f413491](https://github.com/EvenToNight/EvenToNight/commit/f41349188dac1e175df01b88485add7dd6a6c4b2))
* **send-message:** change api to send message ([2f5c534](https://github.com/EvenToNight/EvenToNight/commit/2f5c534ab3f7542aeb153774e6e06ae746b2a694))
* **unread-count:** provide api in controller to count unread messages ([db7c4db](https://github.com/EvenToNight/EvenToNight/commit/db7c4db0050ad7e380a52aecb2b25a14c9dff0d0))
* **users-insert:** provide handler for message to insert or update user info ([6996e9e](https://github.com/EvenToNight/EvenToNight/commit/6996e9e8b851342f62cafaedcc4ac9a222710fe6))
* **users-integration:** update integration with user service using rabbit ([fa5abca](https://github.com/EvenToNight/EvenToNight/commit/fa5abcab36a372f2a8668a49c72b0d9db4e6a65e))
* **users-service:** create service for comunication with user ([8e457fd](https://github.com/EvenToNight/EvenToNight/commit/8e457fdf837bd0f5c11aace58dec907a63eda9b8))
* **users-service:** implement logic to integrate users service ([3c1a07c](https://github.com/EvenToNight/EvenToNight/commit/3c1a07cc818233fa4c0a29bd6e70c41b11c27b6b))

### Bug Fixes

* **eslint:** fix error in eslint check ([729679e](https://github.com/EvenToNight/EvenToNight/commit/729679eca17b87d28abfba5c91d8fb080d69f1bb))
* **test-bug:** fix bug in conversation test ([298705e](https://github.com/EvenToNight/EvenToNight/commit/298705e9a6cc7c0168ba8e8fef5079c65b4090e4))

## [1.13.0](https://github.com/EvenToNight/EvenToNight/compare/v1.12.1...v1.13.0) (2026-01-06)

### Features

* **create-event:** implement create event communication with rabbit ([8333a4c](https://github.com/EvenToNight/EvenToNight/commit/8333a4cbdd201ee2e700ce01adc7cf15df031227))
* **follow:** add route to check if a user follow another user ([da8c624](https://github.com/EvenToNight/EvenToNight/commit/da8c624a948e2dbc377c4fbc58ddd4f49df7f573))

## [1.12.1](https://github.com/EvenToNight/EvenToNight/compare/v1.12.0...v1.12.1) (2026-01-02)

### Bug Fixes

* **date:** fix date error in event tests ([7bd2bc8](https://github.com/EvenToNight/EvenToNight/commit/7bd2bc83ba5424815a0f4ada1ffccddb9d353f12))

## [1.12.0](https://github.com/EvenToNight/EvenToNight/compare/v1.11.1...v1.12.0) (2025-12-31)

### Features

* **keycloak:** add createUser method in KeycloakConnection ([2b49fe0](https://github.com/EvenToNight/EvenToNight/commit/2b49fe05fa826ce2f339eeb0fd210ab6480955b6))
* **keycloak:** add deleteUser method and integration tests for KeycloakConnection ([ba3897e](https://github.com/EvenToNight/EvenToNight/commit/ba3897e214afc61646a1d349ca6054a06f66dff9))
* **keycloak:** add Keycloak setup with custom realm ([dfc9f1c](https://github.com/EvenToNight/EvenToNight/commit/dfc9f1cbc355bd46e44df050155bcb9ab16b0b88))
* **keycloak:** create 'users-service' client in 'eventonight' realm with configurable secret ([45e28ed](https://github.com/EvenToNight/EvenToNight/commit/45e28ed3636d55170c537cc647670a8aa068ddc6))
* **keycloak:** switch from dev mode to simulated production mode ([aef2c64](https://github.com/EvenToNight/EvenToNight/commit/aef2c644360cd28b184cf45f3bbb7f3f9c908f94))
* **provisioning:** assign manage-users role to 'users-service' service account ([0af77e2](https://github.com/EvenToNight/EvenToNight/commit/0af77e235247f2b673e2c3fd673a5920f36c75af))
* **register:** add /register route and authentication service wiring ([7b95e9c](https://github.com/EvenToNight/EvenToNight/commit/7b95e9c93c6e73b7b6a2d3346b0c1c04259eb338))
* **registration:** add registration models, default profiles and upickle dependency ([daece15](https://github.com/EvenToNight/EvenToNight/commit/daece158ac70d92bd187e4b5790458ad10e55320))
* **users:** add Member model classes ([13f9a98](https://github.com/EvenToNight/EvenToNight/commit/13f9a98dced51c0eebf6473de96f3f6083e9df49))
* **users:** add MongoConnection object and custom codecs for MemberAccount and MemberProfile ([3479962](https://github.com/EvenToNight/EvenToNight/commit/3479962439acf93b01cc099f6a12d5db5a62f3af))
* **users:** add Organization model classes ([3c3f777](https://github.com/EvenToNight/EvenToNight/commit/3c3f7779723dde2fd3aeeca0752c131ea1279458))
* **users:** add RabbitConnection, Wiring and UserRoutes objects ([f048e43](https://github.com/EvenToNight/EvenToNight/commit/f048e4302edd249b4ef6dc66f2f3be3f632641e1))
* **users:** add UserService and MemberRepository classes ([60fed9a](https://github.com/EvenToNight/EvenToNight/commit/60fed9a52c54348740f2f42e03f35323d172ed35))
* **users:** extend UserService to handle inserting organizations in MongoDB ([945cf04](https://github.com/EvenToNight/EvenToNight/commit/945cf0467ae1e3c4a062c8869b3e69e615fd2d01))
* **users:** implement /login, /:userId and / ([655090f](https://github.com/EvenToNight/EvenToNight/commit/655090ff9efda67bac974b04472bd41f285e72da))
* **users:** implement Keycloak password grant ([16427a6](https://github.com/EvenToNight/EvenToNight/commit/16427a6cbd07ad981539cfb82600a431235343e6))
* **users:** retrieve access token from Keycloak using users-service client credentials ([b8f2dc7](https://github.com/EvenToNight/EvenToNight/commit/b8f2dc737909e42edda2622a1659fd831cdc9c6d))
* **users:** return access token with generated userId on registration ([755b641](https://github.com/EvenToNight/EvenToNight/commit/755b6415284bcd48319e18fcb953a09911ce7b67))

### Bug Fixes

* **keycloak:** update configuration to make Keycloak run on CI ([a8d4daf](https://github.com/EvenToNight/EvenToNight/commit/a8d4daf01a3a72aacc532d001d280c812b20eff6))
* **mongo-connection:** use MONGOHOST from sys.env if present ([874cce6](https://github.com/EvenToNight/EvenToNight/commit/874cce65fa31406b121baf0a875b0e2661276b67))

## [1.11.1](https://github.com/EvenToNight/EvenToNight/compare/v1.11.0...v1.11.1) (2025-12-29)

### Bug Fixes

* **date:** add date reviver interceptor in API client ([afdf612](https://github.com/EvenToNight/EvenToNight/commit/afdf6122c153569c5191190722c8ddeee48311ae))

## [1.11.0](https://github.com/EvenToNight/EvenToNight/compare/v1.10.0...v1.11.0) (2025-12-29)

### Features

* **Dockerfile-search:** match all files named Dockerfile* and add check for HEAD commit ([2a9e6ac](https://github.com/EvenToNight/EvenToNight/commit/2a9e6ac65d8b15b72d36eb98b438ed33e3075c5f))

### Bug Fixes

* **Dockerfile-search:** change commit sha selection in pull-request context ([6893176](https://github.com/EvenToNight/EvenToNight/commit/68931761be54fad3f441e11a954ec7643db50992))
* **Dockerfile-search:** correctly split multiple dockerfiles under same folder ([2dd0b59](https://github.com/EvenToNight/EvenToNight/commit/2dd0b59be1ff4f41e2ca03eac470b81fe37324ef))
* **Dockerfile-search:** search dockerfiles under /infrastructures/sub-fodler/ and services/sub-folder/ ([b4476d2](https://github.com/EvenToNight/EvenToNight/commit/b4476d2fba953729456c89ca96202d8ba8c34b1e))

## [1.10.0](https://github.com/EvenToNight/EvenToNight/compare/v1.9.0...v1.10.0) (2025-12-20)

### Features

* **interactions:** implement nest architecture for interactions service ([858910a](https://github.com/EvenToNight/EvenToNight/commit/858910a43c9c8611a15ec248360885f3b8ffc4fd))

## [1.9.0](https://github.com/EvenToNight/EvenToNight/compare/v1.8.1...v1.9.0) (2025-12-18)

### Features

* **search:** add initial filters to explore page ([777ddf3](https://github.com/EvenToNight/EvenToNight/commit/777ddf3ea8c04556fbc8dbdf985b3aa38f84ddaf))
* **search:** search events based on filters ([d20e059](https://github.com/EvenToNight/EvenToNight/commit/d20e05945a5e869781fc4763eeb0c57e87dbd435))

### Bug Fixes

* **date:** add Z at the end of 'yyyy-mm-dd:hh:mm' dates to convert it in localtime when create date ([b7d8ffa](https://github.com/EvenToNight/EvenToNight/commit/b7d8ffa3f98dacd68c245231f1e91408c8f97cda))
* **filters:** keep filters when typing a query and handle newly selected vs applied filters separately ([f74dc40](https://github.com/EvenToNight/EvenToNight/commit/f74dc4068b2a03351510c4cf40df8c53604bbf1a))
* **search:** account for undefined tags ([3c4bfc8](https://github.com/EvenToNight/EvenToNight/commit/3c4bfc878c47782b00e4434c1869460478a2002a))

## [1.8.1](https://github.com/EvenToNight/EvenToNight/compare/v1.8.0...v1.8.1) (2025-12-15)

### Bug Fixes

* **protocol:** use https link in dev deployed environment ([bf8fc95](https://github.com/EvenToNight/EvenToNight/commit/bf8fc95105a2802acaf7b87b5b0ae661046943f7))

## [1.8.0](https://github.com/EvenToNight/EvenToNight/compare/v1.7.0...v1.8.0) (2025-12-15)

### Features

* **event:** set fields in event creation as optional ([73383f3](https://github.com/EvenToNight/EvenToNight/commit/73383f31c38320805be6587fe953082ebaaf1897))

## [1.7.0](https://github.com/EvenToNight/EvenToNight/compare/v1.6.1...v1.7.0) (2025-12-15)

### Features

* **client:** support formData in post request ([2f3c0e0](https://github.com/EvenToNight/EvenToNight/commit/2f3c0e0667bb225ff4f82564403a660c4d9d2cf5))
* **event-creation:** add delete button ([fc844bd](https://github.com/EvenToNight/EvenToNight/commit/fc844bd417058f00d480a55a2b4aa1bd11529967))
* **event-visualization:** add infinite scroll in eventTab ([80326e8](https://github.com/EvenToNight/EvenToNight/commit/80326e8cffc5357a0dcaaa563863927ff75ba060))
* **events:** add guards for event details and event editing ([279642f](https://github.com/EvenToNight/EvenToNight/commit/279642feb641710ed76fadb0be3d2965003cd0e6))
* **events:** support draft publication ([799f495](https://github.com/EvenToNight/EvenToNight/commit/799f495a6d271b60ac06f13a093316f1ba2d48d6))

### Bug Fixes

* **deploy-ci:** wait for application to go up before restart traefik ([388a6ba](https://github.com/EvenToNight/EvenToNight/commit/388a6ba63d69f0e1449b5a1eb9e336e17942db0b))
* **media:** fix image get request ([b3229f8](https://github.com/EvenToNight/EvenToNight/commit/b3229f894207a4a9d78d7595a3b3a6603ac50761))
* **NavigationBar:** profile action always close hamburger menu instead of toggle it ([2277a5b](https://github.com/EvenToNight/EvenToNight/commit/2277a5bb851938b64829f3c8e98e5786ce4f6ee1))

## [1.6.1](https://github.com/EvenToNight/EvenToNight/compare/v1.6.0...v1.6.1) (2025-12-14)

### Bug Fixes

* **search-event:** fix bug in search event by id_organization ([92f4780](https://github.com/EvenToNight/EvenToNight/commit/92f47800ffbfc3ed7bf0b0f6fa2afd1df3c60553))

## [1.6.0](https://github.com/EvenToNight/EvenToNight/compare/v1.5.1...v1.6.0) (2025-12-13)

### Features

* **filteredEvent:** add routes for filter event get ([2eabe03](https://github.com/EvenToNight/EvenToNight/commit/2eabe03f17b173fcd8f8513ad50326f12436baf1))
* **test:** add test for filter event ([13b9e87](https://github.com/EvenToNight/EvenToNight/commit/13b9e87b09fb9b38be004eaff4203e5e14f9042f))

## [1.5.1](https://github.com/EvenToNight/EvenToNight/compare/v1.5.0...v1.5.1) (2025-12-10)

### Bug Fixes

* **ci:** run ci ([6bacdef](https://github.com/EvenToNight/EvenToNight/commit/6bacdefd08936d8f9c706a88e02659981dcb7026))

## [1.5.0](https://github.com/EvenToNight/EvenToNight/compare/v1.4.1...v1.5.0) (2025-12-10)

### Features

* **eventCard:** add likes, collaborator and tags ([3712134](https://github.com/EvenToNight/EvenToNight/commit/37121342ace004a7edd87dd4e88233c49575c8d9))
* **eventCard:** design eventCard ([6955e7f](https://github.com/EvenToNight/EvenToNight/commit/6955e7fbc8feff8565aad7762ecbeeab6ba4a796))
* **eventCard:** design eventCard ([4d32de7](https://github.com/EvenToNight/EvenToNight/commit/4d32de7ff52e0bcd6b353ca27d2f6831d508073b))
* **footer:** add simple footer ([9dbe2c7](https://github.com/EvenToNight/EvenToNight/commit/9dbe2c783e31c2d36510707e01061c7bc800d1b6))
* **frontend-api-layer:** setup api layer to make easier to setup mocked api ([445ac32](https://github.com/EvenToNight/EvenToNight/commit/445ac32541623f4bf64028f0ac573861d25d3c08))
* **frontend-api-layer:** use api in views ([220ea17](https://github.com/EvenToNight/EvenToNight/commit/220ea17541eb2f4cc1b4a0d15d93183db3e32a83))
* **frontend-layout:** use max-width to limit horizontal strecth on big screens ([5acd145](https://github.com/EvenToNight/EvenToNight/commit/5acd14543244b2097ba055e41e6d3d5294789957))
* **i18n:** setup i18n and automatic translation ([8d79889](https://github.com/EvenToNight/EvenToNight/commit/8d7988971f433b8098613edb419f689bd1df9074))
* **location:** get location from open streetmap and generate maps link ([f8b5f3d](https://github.com/EvenToNight/EvenToNight/commit/f8b5f3d4d63c947f7adf9cc6312360fac7ecc411))
* **mobileNavigationBar:** add hamburger menu to the left to show buttons ([7305dfe](https://github.com/EvenToNight/EvenToNight/commit/7305dfe4e199e9db5a118440f943b8b7ecd3e4d5))
* **navigation-bar:** adapt guest navbar for mobile ([ba9e212](https://github.com/EvenToNight/EvenToNight/commit/ba9e2121d9ca131e8ab73f159d52b31fda23ccac))
* **navigation-bar:** guest navbar with theme ([4853808](https://github.com/EvenToNight/EvenToNight/commit/4853808e57e8527eec36e16d4b411f9f66d16200))
* **navigation-bar:** setup navigation bar ([743b4b4](https://github.com/EvenToNight/EvenToNight/commit/743b4b4d7caa33d963f7dd3674108906069dbbac))
* **organizationProfile:** design organization profile ([fa6d64e](https://github.com/EvenToNight/EvenToNight/commit/fa6d64e1fff92e2b8eef5ef86fbffa26a465a2f1))

### Bug Fixes

* **AuthForm:** make register button full-width and fix navigation between register and login ([1580125](https://github.com/EvenToNight/EvenToNight/commit/15801256e6502b93bdc430b90162344e47d06887))
* **deploy:** restart traefik after deploy new images to dev server ([3a67c54](https://github.com/EvenToNight/EvenToNight/commit/3a67c54f78ce53e9313018021eec4dd515fd993f))
* **guards:** fix redirection and put guard on create-event ([88bea63](https://github.com/EvenToNight/EvenToNight/commit/88bea6314d79fa5eadd2cf55cbbc33f55c374be3))
* **i18n:** update page url when swicth to another language ([c738326](https://github.com/EvenToNight/EvenToNight/commit/c738326a89d42d74021035e2b8bedb61aaef33f3))
* **mobileSearchBar:** show mobileSearchBar in navigationBar only for when isMobile ([e75000d](https://github.com/EvenToNight/EvenToNight/commit/e75000d2de842f3ea8c3d75c00cb6ec09a0175a0))
* **release-workflow:** avoid duplicates when check for modified services directories ([5124586](https://github.com/EvenToNight/EvenToNight/commit/5124586517de7f31cce13ac6202e2a6e72e9b977))
* **searchBar:** fix searchBar integration between navbar and hero for both desktop and mobile ([5ef2d50](https://github.com/EvenToNight/EvenToNight/commit/5ef2d500a6458beeef7a528bf10f72db48fa84f4))

## [1.4.1](https://github.com/EvenToNight/EvenToNight/compare/v1.4.0...v1.4.1) (2025-12-09)

### Bug Fixes

* **CORS:** fix bug with CORS ([224a29b](https://github.com/EvenToNight/EvenToNight/commit/224a29b82feb772ef0be729690f5d49f82a14932))

## [1.4.0](https://github.com/EvenToNight/EvenToNight/compare/v1.3.0...v1.4.0) (2025-12-08)

### Features

* **create-events:** complete api with connection with media service ([0994ffa](https://github.com/EvenToNight/EvenToNight/commit/0994ffa78ef98061aff4e95b3021f78544bbd213))
* **event:** provide new api for event service ([d21fc56](https://github.com/EvenToNight/EvenToNight/commit/d21fc56ea1bbb7bae15e6a711a6e23ab8c445d38))
* **updateEvent:** implement API for update event ([c2fdfd0](https://github.com/EvenToNight/EvenToNight/commit/c2fdfd07b3d9d3614c7ce6ef8497b775bb66e078))
* **updateEvent:** implement domainEvent for update ([2981227](https://github.com/EvenToNight/EvenToNight/commit/29812272aa8b5cd2783cab41e58916c3e40c4045))
* **validateCommands:** refactor of validate process for commands ([386e168](https://github.com/EvenToNight/EvenToNight/commit/386e1681c9985aee8f56a7f0994a25376a20f726))

## [1.3.0](https://github.com/EvenToNight/EvenToNight/compare/v1.2.0...v1.3.0) (2025-11-15)

### Features

* **event:** implement first version of service architecture ([26776c7](https://github.com/EvenToNight/EvenToNight/commit/26776c7b47aed1af570516e43e29c46f45a402fb))
* **media:** config media service to store images and media ([82c17ec](https://github.com/EvenToNight/EvenToNight/commit/82c17ec6bb993fc192762de13db7a4be000eadb9))
* **media:** implement all media service API routes ([c9a6d7d](https://github.com/EvenToNight/EvenToNight/commit/c9a6d7d97254afe5d6cf1343d26cf52b64c197da))
* **mongodb:** config connection to events database ([c84238b](https://github.com/EvenToNight/EvenToNight/commit/c84238b6f854176bd75ba95b4f202c1149b7a417))

## [1.2.0](https://github.com/EvenToNight/EvenToNight/compare/v1.1.0...v1.2.0) (2025-10-23)

### Features

* **project-configuration:** complete basic project setup ([ec0cf1e](https://github.com/EvenToNight/EvenToNight/commit/ec0cf1e4e554f905787c83769e40faf0e1db1f78))

## [1.1.0](https://github.com/EvenToNight/EvenToNight/compare/v1.0.0...v1.1.0) (2025-09-30)

### Features

* **compose-scripts:** add support for --help or -h on windows ([190d486](https://github.com/EvenToNight/EvenToNight/commit/190d486fc72a156a9297e4fb7b591265e44ffaa5))
* **compose-scripts:** improve and document scripts to handle compose files ([24a7679](https://github.com/EvenToNight/EvenToNight/commit/24a7679b06e29ff6a2217c298597d06c721d1abd))
* **dev-testing:** run scala test waiting for dev environment to be available ([1e9df9d](https://github.com/EvenToNight/EvenToNight/commit/1e9df9d835f56ebede87cc78225c8e660b8637d8))

## 1.0.0 (2025-09-26)

### Features

* **users-service:** setup users service ([bd067d6](https://github.com/EvenToNight/EvenToNight/commit/bd067d6a3d1d9238fb0a56f615b6dd9bbb171572))
