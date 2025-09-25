plugins {
    scala
    application
}

dependencies {
    implementation("org.scala-lang:scala3-library_3:3.7.2")
    implementation("org.mongodb:mongodb-driver-sync:5.5.1")
    implementation("com.rabbitmq:amqp-client:5.26.0")
    implementation("io.github.cdimascio:dotenv-java:3.2.0")
    implementation("com.lihaoyi:cask_3:0.10.1")
    testImplementation("org.scalatest:scalatest_3:3.2.19")
}

application {
    mainClass.set("Main")
}

tasks.withType<ScalaCompile> {
    scalaCompileOptions.apply {
        additionalParameters = listOf("-deprecation", "-feature")
    }
}