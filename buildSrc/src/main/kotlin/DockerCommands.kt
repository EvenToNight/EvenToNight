object DockerCommands {
    const val TEARDOWN_TEST_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --project-name eventonight-test-environment down -v --remove-orphans"
    const val TEARDOWN_DEV_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --dev down -v --remove-orphans"
    const val TEARDOWN_APPLICATION_ENVIRONMENT = "./scripts/composeApplication.sh down --dev -v --remove-orphans"
    const val TEARDOWN_FRONTEND_ENVIRONMENT = "$TEARDOWN_APPLICATION_ENVIRONMENT -eP services/frontend --project-name eventonight-frontend-environment"
    const val SETUP_TEST_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --project-name eventonight-test-environment up -d --force-recreate --wait"
    const val SETUP_DEV_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --dev up -d --force-recreate"
    const val SETUP_APPLICATION_ENVIRONMENT = "./scripts/composeApplication.sh --dev up -d --build --force-recreate --wait"
    const val SETUP_FRONTEND_ENVIRONMENT = "$SETUP_APPLICATION_ENVIRONMENT -eP services/frontend --project-name eventonight-frontend-environment"
}