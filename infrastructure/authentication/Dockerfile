FROM quay.io/keycloak/keycloak:21.1.1

COPY ./infrastructure/authentication/start.sh /opt/keycloak/start.sh

COPY ./infrastructure/authentication/realm /opt/keycloak/data/import

ENTRYPOINT ["/opt/keycloak/start.sh"]
