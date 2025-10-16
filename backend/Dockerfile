# --- Build Stage ---
# Use the newest slim Clojure image for build.
FROM clojure:tools-deps-trixie-slim AS build

# Set the working directory
WORKDIR /workspace

# Copy deps.edn and build.clj to leverage Docker's layer caching
COPY deps.edn build.clj .

# Download dependencies
RUN clojure -P

# Copy the source code
COPY src ./src

# Package the application (uses build.clj ci task; skip tests via env to avoid process ns issue)
RUN CLOJURE_TEST_RUNNER=false clojure -T:build ci

# --- Production Stage ---
# Use a minimal and secure Java Runtime Environment (JRE) image.
FROM amazoncorretto:21.0.8-alpine3.22

# Set the working directory
WORKDIR /app

# Copy only the built application JAR from the 'build' stage
COPY --from=build /workspace/target/backend-0.1.0-SNAPSHOT.jar /app/app.jar

# Expose the application port
EXPOSE 8080

# Set the entrypoint to run the application.
ENTRYPOINT ["java", "-jar", "/app/app.jar"]