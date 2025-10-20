FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /home/app

RUN mkdir -p .git/hooks

COPY ./build.gradle.kts .
COPY ./settings.gradle.kts .
COPY ./buildSrc ./buildSrc
COPY ./gradle ./gradle
COPY ./gradlew .

COPY ./services/events ./services/events

RUN ./gradlew dependencies --no-daemon

RUN ./gradlew shadowJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /home/app

COPY --from=builder /home/app/services/events/build/libs/*.jar ./app.jar

EXPOSE $PORT

ENTRYPOINT ["java", "-jar", "/home/app/app.jar"]