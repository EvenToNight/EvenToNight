plugins {
    id("convention.scala-service")
}

application {
    mainClass.set("app.Main")
}

dependencies {
    implementation("org.scala-lang:scala3-library_3:3.7.2")
    implementation("org.mongodb:mongodb-driver-sync:5.5.1")
    implementation("com.rabbitmq:amqp-client:5.26.0")
    implementation("com.lihaoyi:cask_3:0.11.3")
    implementation("com.github.jwt-scala:jwt-core_3:10.0.1")
    implementation("com.lihaoyi:upickle_3:4.0.2")
    implementation("com.lihaoyi:requests_3:0.8.0")
    implementation("io.circe:circe-core_3:0.14.7")
    implementation("io.circe:circe-generic_3:0.14.7")
    implementation("io.circe:circe-parser_3:0.14.7")
    testImplementation("org.scalatest:scalatest_3:3.2.19")
    testRuntimeOnly("org.scalatestplus:junit-5-13_3:3.2.19.0")
}

tasks.test {
    dependsOn(rootProject.tasks.named("setupTestEnvironment"))
    finalizedBy(rootProject.tasks.named("teardownTestEnvironment"))
}

tasks.shadowJar {
    archiveFileName.set("events.jar")
    manifest {
        attributes["Main-Class"] = "app.Main"
    }
}

tasks.jacocoTestReport {
    classDirectories.setFrom(files(classDirectories.files.map {
        fileTree(it) {
            exclude(
                "**/app/Main**",
                "**/controller/**",
                "**/routes/**",
                "**/middleware/**",
                "**/infrastructure/**",
            )
        }
    }))
}
