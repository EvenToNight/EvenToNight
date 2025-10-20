FROM gradle:8.8 AS builder
WORKDIR /home/app

COPY . /home/app

RUN gradle assemble --no-daemon -x test

FROM eclipse-temurin:21
WORKDIR /home/app

COPY --from=builder /home/app/build/libs/*.jar ./app.jar

EXPOSE $PORT

ENTRYPOINT ["java", "-jar", "/home/app/app.jar"]
