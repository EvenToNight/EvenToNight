plugins {
    `kotlin-dsl`
}

repositories {
    mavenCentral()
    gradlePluginPortal()
}

dependencies {
    implementation("com.github.node-gradle:gradle-node-plugin:7.1.0")
    implementation("com.github.johnrengelman:shadow:8.1.1")
    implementation("gradle.plugin.cz.alenkacz:gradle-scalafmt:1.16.2")
    implementation("io.github.cosmicsilence:gradle-scalafix:0.2.5")
}