import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("convention.node-service")
}

tasks.named("build") {
    dependsOn(":libs:nestjs-common:build")
}

tasks.register<NpmTask>("unitTest") {
    group = "verification"
    description = "Runs the unit test suite."
    dependsOn("npmInstall")
    args.set(listOf("run", "test"))
}

tasks.register<NpmTask>("integrationTest") {
    group = "verification"
    description = "Runs the integration test suite."
    dependsOn("npmInstall")
    args.set(listOf("run", "test:integration"))
}

tasks.register<NpmTask>("e2eTest") {
    group = "verification"
    description = "Runs the end-to-end test suite."
    dependsOn("npmInstall")
    args.set(listOf("run", "test:e2e"))
}