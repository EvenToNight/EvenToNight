object DockerCommands {
    const val TEARDOWN_TEST_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --project-name eventonight-test-environment down -v --remove-orphans"
    const val TEARDOWN_DEV_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --dev down -v --remove-orphans"
    const val TEARDOWN_APPLICATION_ENVIRONMENT = "pkill -f 'stripe listen' || true && ./scripts/composeApplication.sh down --dev -v --remove-orphans"
    const val TEARDOWN_KEYCLOAK = "./scripts/composeAll.sh -p ./infrastructure/authentication/ --dev down -v --remove-orphans --project-name keycloak-stack"
    const val TEARDOWN_FRONTEND_ENVIRONMENT = "$TEARDOWN_APPLICATION_ENVIRONMENT -eP services/frontend --project-name eventonight-frontend-environment"
    const val TEARDOWN_MEDIA = "./scripts/composeAll.sh -p ./services/media/ --dev down -v --remove-orphans --project-name media-service"
    const val SETUP_TEST_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --project-name eventonight-test-environment up -d --force-recreate --wait"
    const val SETUP_DEV_ENVIRONMENT = "./scripts/composeDevEnvironment.sh --dev up -d --force-recreate --wait"
    const val SETUP_APPLICATION_ENVIRONMENT = "sed -i '' '/^STRIPE_WEBHOOK_SECRET=/d' .env && nohup ./services/payments/scripts/local-webooks.sh > webhook.log 2>&1 & echo '⏳ Waiting for webhook listener...' && until grep -q 'STRIPE_WEBHOOK_SECRET=whsec_' .env 2>/dev/null; do sleep 1; done && echo '✅ Webhook listener ready' && ./scripts/composeApplication.sh --dev up -d --build --force-recreate --wait"
    const val SETUP_KEYCLOAK = "./scripts/composeAll.sh -p ./infrastructure/authentication/ --dev up --force-recreate --build -d --wait --project-name keycloak-stack && docker wait keycloak-stack-keycloak-provision-1"
    const val SETUP_FRONTEND_ENVIRONMENT = "$SETUP_APPLICATION_ENVIRONMENT -eP services/frontend --project-name eventonight-frontend-environment"
    const val SETUP_MEDIA_SERVICE = "./scripts/composeAll.sh -p ./services/media/ --dev up --force-recreate --build -d --wait --project-name media-service"
}
