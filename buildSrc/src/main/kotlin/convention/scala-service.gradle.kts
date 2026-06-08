package convention

import io.github.cosmicsilence.scalafix.ScalafixTask
import io.github.cosmicsilence.scalafix.ConfigSemanticDbTask
import org.gradle.api.tasks.scala.ScalaCompile

plugins {
    scala
    application
    id("com.github.johnrengelman.shadow")
    id("cz.alenkacz.gradle.scalafmt")
    id("io.github.cosmicsilence.scalafix")
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

tasks.withType<ScalafixTask>().configureEach {
    notCompatibleWithConfigurationCache("Scalafix Gradle plugin is not compatible with configuration cache")
}

tasks.withType<ConfigSemanticDbTask>().configureEach {
    notCompatibleWithConfigurationCache("Scalafix Gradle plugin is not compatible with configuration cache")
}

tasks.withType<ScalaCompile>().configureEach {
    scalaCompileOptions.apply {
        additionalParameters = listOf("-deprecation", "-feature", "-Wunused:imports", "-Wunused:all")
    }
}

tasks.register("formatAndLintPreCommit") {
    group = "git"
    description = "Formats and lints staged files for the pre-commit hook."
    dependsOn("scalafix", "scalafmtAll")
}

tasks.named("jar") {
    enabled = false
}

tasks.named("build") {
    dependsOn(tasks.named("shadowJar"))
}

tasks.named("distZip") {
    dependsOn(tasks.named("shadowJar"))
}

tasks.named("distTar") {
    dependsOn(tasks.named("shadowJar"))
}

tasks.named("startScripts") {
    dependsOn(tasks.named("shadowJar"))
}

tasks.register("checkStyle") {
    dependsOn("checkScalafix", "checkScalafmtAll")
}

tasks.named<JacocoReport>("jacocoTestReport") {
    dependsOn(tasks.test)
    reports {
        xml.required.set(true)
        html.required.set(true)
    }
}

tasks.test {
    useJUnitPlatform {
        includeEngines("scalatest")
        testLogging {
            showStandardStreams = true
            events("passed", "skipped", "failed")
        }
    }
    finalizedBy(tasks.named("jacocoTestReport"))
}

tasks.register("runCoverage") {
    group = "verification"
    description = "Run coverage analysis for Events service"
    dependsOn("test", "jacocoTestReport")
}
