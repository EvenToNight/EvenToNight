FROM eclipse-temurin:21

WORKDIR /home/app/

RUN mkdir -p .git/hooks
COPY gradlew .
COPY gradle ./gradle
COPY build.gradle.kts .
COPY settings.gradle.kts .
COPY buildSrc ./buildSrc

EXPOSE 9010

COPY ./services/events ./services/events

RUN ./gradlew assemble

# Run the events project using the project-local wrapper
CMD ["./gradlew", "services:events:run"]