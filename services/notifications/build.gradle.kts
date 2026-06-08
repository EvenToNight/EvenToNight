import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("convention.node-service")
}

node {
    version.set("20.11.1")
}

tasks.register<NpmTask>("unitTest") {
    group = "verification"
    description = "Runs the unit test suite."
    dependsOn("npmInstall")
    args.set(listOf("run", "test"))
}