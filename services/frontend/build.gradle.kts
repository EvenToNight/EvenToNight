import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("com.github.node-gradle.node") version "7.1.0"
    base
}

node {
    version = "22.20.0"
    download = true
}

tasks.named("build") {
    dependsOn("npmInstall")
}

tasks.register<NpmTask>("runDev"){
    dependsOn("npmInstall")
    npmCommand.set(listOf("run","dev"))
}

tasks.register<NpmTask>("checkStyle"){
    dependsOn("npmInstall")
    npmCommand.set(listOf("run","lint"))
}

tasks.register<NpmTask>("formatAndLint"){
    dependsOn("npmInstall")
    npmCommand.set(listOf("run","lint:fix"))
}




