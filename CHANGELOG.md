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
