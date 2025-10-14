FROM clojure:1.11.1-lein as builder
WORKDIR /app
COPY project.clj .
RUN lein deps
COPY src ./src
COPY resources ./resources
RUN lein uberjar

FROM openjdk:21-jdk-slim
WORKDIR /app
COPY --from=builder /app/target/uberjar/backend-standalone.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]