plugins {
    application
}

repositories {
    mavenCentral()
}

java {
    toolchain {
        languageVersion.set(JavaLanguageVersion.of(17))
    }
}

dependencies {
    implementation(libs.slf4j.api)
    runtimeOnly(libs.slf4j.simple)

    implementation(libs.http.components)
    implementation(libs.jackson.databind)
    implementation(libs.lucene.queryparser)
    implementation(libs.lucene.analysis)
}

application {
    mainClass.set("dgroomes.Runner")
}
