plugins {
    id("convention.node-service")
}

tasks.named("npmBuild") {
    dependsOn(":libs:ts-common:build")
}
