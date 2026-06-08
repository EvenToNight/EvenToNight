package convention

import com.github.gradle.node.npm.task.NpmTask

plugins {
    base
    id("com.github.node-gradle.node")
}

node {
    version.set("20.19.0")
    download.set(true)
    workDir.set(layout.buildDirectory.dir("nodejs").get().asFile)
    npmWorkDir.set(layout.buildDirectory.dir("npm").get().asFile)
    nodeProjectDir.set(file(project.projectDir))
}

tasks.register<NpmTask>("npmBuild") {
    group = "build"
    description = "Runs npm run build."
    dependsOn("npmInstall")
    args.set(listOf("run", "build", "--if-present"))
}

tasks.named("build") {
    dependsOn("npmInstall")
    dependsOn("checkStyle")
    dependsOn("npmBuild")
}

tasks.register<NpmTask>("checkStyle") {
    group = "verification"
    description = "Runs lint checks."
    dependsOn("npmInstall")
    args.set(listOf("run", "lint", "--if-present"))
}

tasks.register<NpmTask>("formatAndLint") {
    group = "verification"
    description = "Formats and lints the project."
    dependsOn("npmInstall")
    args.set(listOf("run", "format", "--if-present"))
}

tasks.register<NpmTask>("run") {
    group = "application"
    description = "Starts the local development server."
    dependsOn("npmInstall")
    args.set(listOf("run", "start:dev", "--if-present"))
}

tasks.register<NpmTask>("test") {
    group = "verification"
    description = "Runs the test suite."
    dependsOn("npmInstall")
    args.set(listOf("run", "test", "--if-present"))
}

tasks.register<NpmTask>("testWithCoverage") {
    group = "verification"
    description = "Runs tests with coverage enabled."
    dependsOn("npmInstall")
    args.set(listOf("run", "test:cov", "--if-present", "--", "--passWithNoTests"))
}

tasks.register<NpmTask>("typeCheck") {
    group = "verification"
    description = "Runs TypeScript type checking."
    dependsOn("npmInstall")
    args.set(listOf("run", "type-check", "--if-present"))
}

tasks.register("runCoverage") {
    group = "verification"
    description = "Runs tests with coverage."
    dependsOn("testWithCoverage")
}

tasks.register("formatAndLintPreCommit") {
    group = "git"
    description = "Formats and lints staged files for the pre-commit hook."
    dependsOn("formatAndLint")
    dependsOn("typeCheck")
}

tasks.named("check") {
    dependsOn("checkStyle")
    dependsOn("typeCheck")
    dependsOn("runCoverage")
}
