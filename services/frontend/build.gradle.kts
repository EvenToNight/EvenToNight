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





