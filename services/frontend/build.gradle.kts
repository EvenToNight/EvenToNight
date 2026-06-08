import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("com.github.node-gradle.node")
    base
}

node {
    version = "22.20.0"
}

tasks.register<NpmTask>("translateI18n") {
    dependsOn("npmInstall")
    finalizedBy("formatAndLint")
    npmCommand.set(listOf("run", "translate:i18n"))
}