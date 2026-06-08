import org.gradle.api.tasks.scala.ScalaCompile

plugins {
    id("convention.scala-service")
}

application {
    mainClass.set("Main")
}

dependencies {
    implementation("org.scala-lang:scala3-library_3:3.7.2")
    implementation("org.mongodb:mongodb-driver-sync:5.5.1")
    implementation("com.rabbitmq:amqp-client:5.26.0")
    implementation("io.github.cdimascio:dotenv-java:3.2.0")
    implementation("com.softwaremill.sttp.client3:core_3:3.9.0")
    implementation("com.softwaremill.sttp.client3:httpclient-backend_3:3.5.2")
    implementation("io.circe:circe-core_3:0.14.7")
    implementation("io.circe:circe-parser_3:0.14.7")
    implementation("io.circe:circe-generic_3:0.14.7")
    implementation("io.circe:circe-literal_3:0.14.7")
    implementation("com.lihaoyi:cask_3:0.11.3")
    implementation("com.lihaoyi:requests_3:0.8.0")
    implementation("com.github.jwt-scala:jwt-core_3:11.0.3")
    implementation("io.undertow:undertow-core:2.3.12.Final")
    implementation("org.jboss.logging:jboss-logging:3.5.3.Final")
    testImplementation("org.scalatest:scalatest_3:3.2.19")
    testImplementation("org.mockito:mockito-core:5.12.0")
    testRuntimeOnly("org.junit.platform:junit-platform-engine:1.13.1")
    testRuntimeOnly("org.junit.platform:junit-platform-launcher:1.13.1")
    testRuntimeOnly("org.scalatestplus:junit-5-13_3:3.2.19.0")
    compileOnly("org.wartremover:wartremover_2.13:3.1.5")
}

tasks.withType<ScalaCompile>().configureEach {
    options.compilerArgs.addAll(listOf(
        "-Xplugin-require:wartremover",
        "-P:wartremover:traverser:org.wartremover.warts.Unsafe",
        "-Xfatal-warnings"
    ))
}

tasks.test {
    dependsOn(
        rootProject.tasks.named("setupTestEnvironment"),
        rootProject.tasks.named("setupKeycloak"),
        rootProject.tasks.named("setupMediaService")
    )
    finalizedBy(
        rootProject.tasks.named("teardownTestEnvironment"),
        rootProject.tasks.named("teardownKeycloak"),
        rootProject.tasks.named("teardownMediaService")
    )
}

tasks.shadowJar {
    archiveFileName.set("users.jar")
    manifest {
        attributes["Main-Class"] = "Main"
    }
}
