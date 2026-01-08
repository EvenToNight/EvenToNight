import io.github.cosmicsilence.scalafix.ScalafixTask
import io.github.cosmicsilence.scalafix.ConfigSemanticDbTask
import org.gradle.api.tasks.scala.ScalaCompile

plugins {
    scala
    application
    id("com.github.johnrengelman.shadow") version "8.1.1"
    id("cz.alenkacz.gradle.scalafmt") version "1.16.2"
    id("io.github.cosmicsilence.scalafix") version "0.2.5"
    jacoco
}

scalafmt {
    configFilePath = ".scalafmt.conf"
}

jacoco {
    toolVersion = "0.8.12" 
}

tasks.matching { it.name.contains("Scalafmt", ignoreCase = true) }.configureEach {
        notCompatibleWithConfigurationCache("Scalafmt plugin not compatible with Gradle configuration cache")
}

tasks.register("checkStyle") {
    dependsOn("checkScalafmtAll")
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
    implementation("com.lihaoyi:cask_3:0.11.3")
    implementation("com.lihaoyi:upickle_3:3.3.1")
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

application {
    mainClass.set("app.Main")
}

tasks.withType<ScalaCompile> {
    scalaCompileOptions.apply {
        additionalParameters = listOf("-deprecation", "-feature")
    }
}

tasks.withType<ScalaCompile>().configureEach {
    options.compilerArgs.addAll(
        listOf(
            "-Xplugin-require:wartremover",
            "-P:wartremover:traverser:org.wartremover.warts.Unsafe",
            "-Xfatal-warnings"
        )
    )
}

tasks.test {
    dependsOn(rootProject.tasks.named("setupTestEnvironment"),rootProject.tasks.named("setupKeycloak"))
    finalizedBy(rootProject.tasks.named("teardownTestEnvironment"), rootProject.tasks.named("teardownKeycloak"))
    useJUnitPlatform {
        includeEngines("scalatest")
        testLogging {
            showStandardStreams = true
            events("passed", "skipped", "failed")
        }
    }
    finalizedBy(tasks.jacocoTestReport)
}

tasks.register("formatAndLintPreCommit") {
    dependsOn("scalafix")
    dependsOn("scalafmtAll")
}

tasks.shadowJar {
    archiveFileName.set("users.jar")
    manifest {
        attributes["Main-Class"] = "Main"
    }
}
tasks.withType<ScalafixTask>().configureEach {
    notCompatibleWithConfigurationCache("Scalafix Gradle plugin is not compatible with configuration cache")
}

tasks.withType<ConfigSemanticDbTask>().configureEach {
    notCompatibleWithConfigurationCache("Scalafix Gradle plugin is not compatible with configuration cache")
}

tasks.withType<ScalaCompile>().configureEach {
    scalaCompileOptions.additionalParameters =
        listOf("-Wunused:imports", "-Wunused:all")
}

tasks {
    val shadowJar by getting(com.github.jengelman.gradle.plugins.shadow.tasks.ShadowJar::class)

    named<Jar>("jar") {
        enabled = false
    }

    named("build") {
        dependsOn(shadowJar)
    }

    named("distZip") {
        dependsOn(shadowJar)
    }

    named("distTar") {
        dependsOn(shadowJar)
    }

    named("startScripts") {
        dependsOn(shadowJar)
    }
}

tasks.jacocoTestReport {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

tasks.register("runCoverage") {
    description = "Run coverage analysis for Users service"
    group = "verification"
    dependsOn("jacocoTestReport")
    
    doLast {
        println("Users service coverage completed!")
        println("Report available at: build/reports/jacoco/test/jacocoTestReport.xml")
    }
}
