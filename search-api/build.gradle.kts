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

val slf4jVersion = "1.7.36" // SLF4J releases: http://www.slf4j.org/news.html
val luceneVersion = "9.2.0" // Lucene releases: https://lucene.apache.org/core/downloads.html
val httpComponentsV5Version = "5.1.3" // HttpComponents v5 releases: https://hc.apache.org/news.html

dependencies {
    implementation("org.slf4j:slf4j-api:$slf4jVersion")
    runtimeOnly("org.slf4j:slf4j-simple:$slf4jVersion")

    implementation("org.apache.httpcomponents.client5:httpclient5:$httpComponentsV5Version")
    implementation("org.apache.lucene:lucene-queryparser:$luceneVersion")
    implementation("org.apache.lucene:lucene-analysis-common:$luceneVersion")
}

application {
    mainClass.set("dgroomes.Runner")
}
