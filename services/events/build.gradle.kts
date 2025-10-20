plugins {
    scala
    application
    id("com.github.johnrengelman.shadow") version "8.1.1"
    id("cz.alenkacz.gradle.scalafmt") version "1.16.2"
}

repositories {
        mavenCentral()
}

application {
    mainClass.set("Main")
}

dependencies {
    implementation("org.scala-lang:scala3-library_3:3.7.2")
    implementation("org.mongodb:mongodb-driver-sync:5.5.1")
    implementation("com.rabbitmq:amqp-client:5.26.0")
    implementation("io.github.cdimascio:dotenv-java:3.2.0")
    implementation("com.lihaoyi:cask_3:0.10.1")
    testImplementation("org.scalatest:scalatest_3:3.2.19")
    testRuntimeOnly("org.junit.platform:junit-platform-engine:1.13.1")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.13.1")
    testRuntimeOnly("org.scalatestplus:junit-5-13_3:3.2.19.0")
    implementation("io.undertow:undertow-core:2.3.12.Final")
    implementation("org.jboss.logging:jboss-logging:3.5.3.Final")
}

scalafmt {
    configFilePath = ".scalafmt.conf"
}

tasks.matching { it.name.contains("Scalafmt", ignoreCase = true) }.configureEach {
        notCompatibleWithConfigurationCache("Scalafmt plugin not compatible with Gradle configuration cache")
}

tasks.register("checkStyle") {
    dependsOn("checkScalafmtAll")
}

tasks.register("formatAndLintPreCommit") {
    dependsOn("scalafmtAll")
}

tasks.withType<ScalaCompile> {
    scalaCompileOptions.apply {
        additionalParameters = listOf("-deprecation", "-feature")
    }
}

tasks.test {
    dependsOn(rootProject.tasks.named("setupTestEnvironment"))
    finalizedBy(rootProject.tasks.named("teardownTestEnvironment"))
    useJUnitPlatform {
        includeEngines("scalatest")
        testLogging {
            showStandardStreams = true
            events("passed", "skipped", "failed")
        }
    }
}

tasks.shadowJar {
    archiveFileName.set("events.jar") 
    manifest {
        attributes["Main-Class"] = "Main"
    }
}