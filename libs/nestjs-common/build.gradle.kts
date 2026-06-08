import com.github.gradle.node.npm.task.NpmTask

plugins {
    base
    id("com.github.node-gradle.node") version "7.1.0"
}

node {
    version.set("20.19.0")
    download.set(true)
    workDir.set(layout.buildDirectory.dir("nodejs").get().asFile)
    npmWorkDir.set(layout.buildDirectory.dir("npm").get().asFile)
    nodeProjectDir.set(file(project.projectDir))
}

val compileTs = tasks.register<NpmTask>("compileTs") {
    group = "build"
    description = "Compiles TypeScript sources."
    dependsOn("npmInstall", ":libs:ts-common:build")
    args.set(listOf("run", "build"))
}

tasks.named("build") {
    dependsOn(compileTs)
}
