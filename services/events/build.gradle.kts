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

application {
    mainClass.set("app.Main")
}

dependencies {
    implementation("org.scala-lang:scala3-library_3:3.7.2")
    implementation("org.mongodb:mongodb-driver-sync:5.5.1")
    implementation("com.rabbitmq:amqp-client:5.26.0")
    implementation("com.lihaoyi:cask_3:0.11.3")
    implementation("com.lihaoyi:requests_3:0.8.0")
    testImplementation("org.scalatest:scalatest_3:3.2.19")
    testRuntimeOnly("org.scalatestplus:junit-5-13_3:3.2.19.0")
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
    dependsOn("checkScalafix")
    dependsOn("checkScalafmtAll")
}

tasks.register("formatAndLintPreCommit") {
    dependsOn("scalafmtAll")
    dependsOn("scalafix")
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
    finalizedBy(tasks.jacocoTestReport)
}

tasks.shadowJar {
    archiveFileName.set("events.jar") 
    manifest {
        attributes["Main-Class"] = "app.Main"
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

tasks.register("runCoverage") {
    description = "Run coverage analysis for Events service"
    group = "verification"
    dependsOn("test", "jacocoTestReport")
    
    doLast {
        println("✅ Events service coverage completed!")
        println("📋 Report available at: build/reports/jacoco/test/jacocoTestReport.xml")
    }
}

afterEvaluate {
    tasks.named("scalafix") {
        mustRunAfter("scalafmtAll")
    }
}