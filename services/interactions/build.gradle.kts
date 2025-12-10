import com.github.gradle.node.npm.task.NpmTask

plugins {
    base
    id("com.github.node-gradle.node") version "7.1.0"
}

node {
    version.set("20.11.1")
    download.set(true)
    workDir.set(file("${project.buildDir}/nodejs"))
    npmWorkDir.set(file("${project.buildDir}/npm"))
    nodeProjectDir.set(file(project.projectDir))
}

tasks.named("build") {
    dependsOn("npmInstall")
}

tasks.register<NpmTask>("checkStyle") {
    group = "verification"
    description = "Runs lint checks for the interactions project."
    dependsOn("npmInstall")
    args.set(listOf("run", "lint"))
}

tasks.register<NpmTask>("formatAndLint") {
    group = "verification"
    description = "Formats and lints the project."
    dependsOn("npmInstall")
    // run the formatting script; package.json defines `format` and `lint`
    args.set(listOf("run", "format"))
}

tasks.register<NpmTask>("run") {
    group = "application"
    description = "Starts the local development server."
    dependsOn("npmInstall", "build")
    args.set(listOf("run", "start:dev"))
}

tasks.register<NpmTask>("test") {
    group = "verification"
    description = "Runs the test suite."
    dependsOn("npmInstall")
    args.set(listOf("run", "test"))
}

tasks.register<NpmTask>("testWithCoverage") {
    group = "verification"
    description = "Runs tests with coverage enabled."
    dependsOn("npmInstall")
    args.set(listOf("run", "test:cov", "--", "--passWithNoTests"))
}

tasks.register("runCoverage") {
    description = "Run coverage analysis for Interactions service"
    group = "verification"
    dependsOn("testWithCoverage")

    doLast {
        println("✅ Interactions service coverage completed!")
        println("📋 Report available at: services/interactions/coverage")
    }
}

tasks.register("formatAndLintPreCommit") {
    group = "git"
    description = "Formats and lints the codebase for pre-commit hook."
    dependsOn("formatAndLint")
}
