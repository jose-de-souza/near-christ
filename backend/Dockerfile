# --- Build Stage ---
# Use an official Maven image to build the application.
FROM maven:3.9.6-eclipse-temurin-21 AS build

# Set the working directory
WORKDIR /workspace

# Copy the pom.xml to leverage Docker's layer caching
COPY pom.xml .

# Download dependencies
RUN mvn dependency:go-offline

# Copy the source code
COPY src ./src

# Package the application
RUN mvn package -DskipTests


# --- Production Stage ---
# Use a minimal and secure Java Runtime Environment (JRE) image. This creates a much smaller final image.
FROM openjdk:21-jdk-slim

# Set the working directory
WORKDIR /app

# Copy only the built application JAR from the 'build' stage
COPY --from=build /workspace/target/backend-0.0.1-SNAPSHOT.jar /app/app.jar

# Expose the application port
EXPOSE 8080

# Set the entrypoint to run the application.
# The Spring profile will be set at runtime (in docker-compose.yml for dev, or with -e for prod).
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
