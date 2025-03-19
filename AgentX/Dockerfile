FROM openjdk:8-jdk-alpine

WORKDIR /app

COPY target/agent-x-*.jar app.jar

ENTRYPOINT ["java", "-jar", "app.jar"]
