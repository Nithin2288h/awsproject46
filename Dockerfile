FROM maven:3.9-eclipse-temurin-23 AS builder

WORKDIR /app

COPY pom.xml .
COPY src ./src

RUN mvn clean package -DskipTests

FROM eclipse-temurin:23-jre

WORKDIR /app

COPY --from=builder /app/target/java-maven-docker-1.0.0.jar app.jar

EXPOSE 8080

CMD ["java", "-jar", "app.jar"]
