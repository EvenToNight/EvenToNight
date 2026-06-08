import com.github.gradle.node.npm.task.NpmTask

plugins {
    id("convention.node-service")
}

node {
    version.set("18.18.0")
}

tasks.named<NpmTask>("run") {
    args.set(listOf("run", "start"))
}
