# NEAR CHRIST BACKEND

The Near Christ Backend is a Spring Boot application providing RESTful APIs for managing dioceses, parishes, adorations, crusades, and users, with JWT-based authentication and role-based access control.

## Prerequisites

- **Java 21**: Ensure JDK 21 is installed.
- **Maven**: For building and dependency management.
- **PostgreSQL**: A running PostgreSQL database (version 12 or higher).
- **Docker** (optional): For containerized deployment.

## Project Setup

### Clone the Repository

```bash
git clone <repository-url>
cd backend
```

### Install Dependencies

Run the following command to install dependencies:

```bash
mvn clean install
```

### Configure Environment Variables

Create a `.env` file in the project root or set environment variables with the following:

```ini
APP_ENV=development
APP_URL=http://localhost:8080
DB_HOST=localhost
DB_PORT=5432
DB_NAME=nearchrist
DB_USER=postgres
DB_PASS=postgres
JWT_SECRET_KEY=b57f579f7fb214aec11daab231ed641b13d5d1d348539a58a937b5b4c6bfaa7d
```

To generate a new `JWT_SECRET_KEY`:

```bash
openssl rand -hex 32
```

### Database Setup and Migrations

The project uses Flyway for database migrations. Migrations are located in `src/main/resources/db/migration`.

#### Connecting to PostgreSQL

Connect to your PostgreSQL database using:

```bash
psql -h localhost -p 5432 -U postgres -d nearchrist
```

Enter the password (default is `postgres` if not set).

#### Running Migrations

Migrations run automatically on application startup. To manually run Flyway:

```bash
mvn flyway:migrate
```

#### Table Creation Order

To avoid foreign key constraint issues, the migration scripts create tables in this order:

1. `USR` (independent)
2. `STA` (base table)
3. `DIO` (depends on `STA`)
4. `PAR` (depends on `DIO` and `STA`)
5. `ADO` (depends on `STA`, `DIO`, `PAR`)
6. `CRU` (depends on `STA`, `DIO`, `PAR`)

#### Dropping Tables

If needed, drop tables in the reverse order to avoid foreign key errors.

Spring Boot with JPA (`spring.jpa.hibernate.ddl-auto=validate`) validates the schema against entities after migrations.

### Application Configuration

The `application.yml` file is located in `src/main/resources`:

```yaml
spring:
  application:
    name: backend
  datasource:
    url: jdbc:postgresql://${DB_HOST:localhost}:${DB_PORT:5432}/${DB_NAME:nearchrist}
    username: ${DB_USER:postgres}
    password: ${DB_PASS:postgres}
    driver-class-name: org.postgresql.Driver
  jpa:
    hibernate:
      ddl-auto: validate
    show-sql: true
    database-platform: org.hibernate.dialect.PostgreSQLDialect
  flyway:
    enabled: true
    locations: classpath:db/migration
jwt:
  secret: ${JWT_SECRET_KEY:your_secret_key_here}
  expiration: 3600000
server:
  port: 8080
```

## Running the Application

### Locally

Build and run the application (migrations will run automatically):

```bash
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

### Using Docker

Build and run the application using Docker:

```bash
docker build -t nearchrist-backend .
docker run -p 8080:8080 --env-file .env nearchrist-backend
```

For a complete setup with PostgreSQL, use `docker-compose`:

```bash
docker-compose up -d
```

This sets up a PostgreSQL container and the application container, linked appropriately.

## Testing

The project uses Testcontainers for integration tests with PostgreSQL. Tests load `test-schema.sql` and `test-data.sql` using @Sql.

Run unit and integration tests:

```bash
mvn test
```

Example test in `AdorationControllerTest.java` verifies endpoints with sample data.

Add similar tests for other controllers as needed.

## Deployment

### Local Deployment

```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

### Docker Deployment

[Installing Docker on Ubuntu](https://docs.docker.com/engine/install/ubuntu/#install-using-the-repository)

See the Docker section above for building and running the Docker container.

## Production Deployment Command
Make sure the .env.prod file is in the same directory on the server.
```bash
# This command builds and deploys the production configuration using the .env.prod file
docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --build
```

## Development Deployment Command

```bash
# This will build and start your dev environment in the background
docker-compose up -d --build
```

## Restarting production after a major change
```bash
docker-compose --env-file .env.prod -f docker-compose.yml -f docker-compose.prod.yml up -d --force-recreate
```