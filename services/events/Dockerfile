FROM gradle:8.8 AS builder
WORKDIR /home/app

COPY ./services/events /home/app

RUN gradle shadowJar --no-daemon -x test

FROM eclipse-temurin:21
WORKDIR /home/app

COPY --from=builder /home/app/build/libs/events.jar ./app.jar

EXPOSE 9010

ENTRYPOINT ["java", "-jar", "/home/app/app.jar"]