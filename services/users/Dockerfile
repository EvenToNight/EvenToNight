FROM eclipse-temurin:21-jre-alpine AS builder
WORKDIR /home/app

RUN mkdir -p .git/hooks

COPY ./build.gradle.kts .
COPY ./settings.gradle.kts .
COPY ./buildSrc/src ./buildSrc/src
COPY ./buildSrc/build.gradle.kts ./buildSrc/build.gradle.kts
COPY ./gradle ./gradle
COPY ./gradlew .

COPY ./services/users/build.gradle.kts ./services/users/build.gradle.kts

RUN ./gradlew dependencies --no-daemon

COPY ./services/users/src ./services/users/src

RUN ./gradlew shadowJar --no-daemon -x test

FROM eclipse-temurin:21-jre-alpine
WORKDIR /home/app

COPY --from=builder /home/app/services/users/build/libs/*.jar ./app.jar

EXPOSE $PORT

ENTRYPOINT ["java", "-jar", "/home/app/app.jar"]