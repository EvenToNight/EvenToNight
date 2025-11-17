FROM quay.io/keycloak/keycloak:21.1.1

COPY start.sh /opt/keycloak/start.sh

COPY realm /opt/keycloak/realm

ENTRYPOINT ["/opt/keycloak/start.sh"]
