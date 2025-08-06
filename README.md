# NEAR CHRIST

This is a full-stack web application called "Near Christ", which appears to be a service of the Australian Medjugorje Centre. The application is designed to manage and display information about Catholic dioceses, parishes, adoration schedules, and rosary crusades.

## About The Project

### Project Architecture

The project follows a classic client-server architecture:

  * **Backend:** A RESTful API built with Java and the Spring Boot framework.
  * **Frontend:** A single-page application (SPA) built with Angular.

### Backend Features

The backend is responsible for data persistence, business logic, and security.

  * **Technologies:**
      * Java 21
      * Spring Boot
      * Spring Data JPA
      * Spring Security
      * PostgreSQL
      * Maven
      * JWT (JSON Web Tokens)
      * Flyway
      * Lombok
      * Testcontainers
  * **Functionality:**
      * **Authentication:** Secure login endpoint (`/auth/login`) that issues a JWT.
      * **CRUD Operations:** Provides REST endpoints for Creating, Reading, Updating, and Deleting (CRUD) States, Dioceses, Parishes, Adoration Schedules, Rosary Crusades, and Users.
      * **Role-Based Access Control:** User roles (ADMIN, SUPERVISOR, STANDARD) control access to API endpoints.

### Frontend Features

The frontend provides the user interface for interacting with the backend API.

  * **Technologies:**
      * Angular & TypeScript
      * Angular Material
      * SCSS
      * RxJS
  * **Functionality:**
      * **Public Views:** Adoration Query and Crusade Query.
      * **Authenticated Views:** Management pages for Adoration Schedules, Dioceses, Parishes, Rosary Crusades, and Users (ADMIN only).
      * **Features:** Drag-and-drop column reordering, confirmation dialogs, and user notifications.

## Prerequisites

  * **Java 21**: Ensure JDK 21 is installed.
  * **Maven**: For building and dependency management.
  * **Node.js and npm**: For running the frontend application.
  * **Angular CLI**: To manage the frontend project.
  * **PostgreSQL**: A running PostgreSQL database (version 12 or higher).
  * **Docker** (optional): For containerized deployment.

## Project Setup

### Clone the Repository

```bash
git clone <repository-url>
cd near-christ
```

### Backend Setup

```bash
cd backend
mvn clean install
```

### Frontend Setup

```bash
cd frontend
npm install
```

### Configure Environment Variables

Create a `.env` file in the `backend` directory with the following content:

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

The project uses Flyway for database migrations. Migrations are located in `backend/src/main/resources/db/migration`.

#### Connecting to PostgreSQL

Connect to your PostgreSQL database using:

```bash
psql -h localhost -p 5432 -U postgres -d nearchrist
```

Enter the password (default is `postgres` if not set).

#### Running Migrations

Migrations run automatically on application startup. To manually run Flyway:

```bash
cd backend
mvn flyway:migrate
```

## Running the Application

### Locally

**Backend:**

```bash
cd backend
mvn spring-boot:run
```

The application will start on `http://localhost:8080`.

**Frontend:**

```bash
cd frontend
ng serve --open
```

Navigate to `http://localhost:4200/`.

### Using Docker

For a complete setup with PostgreSQL, use `docker-compose`:

```bash
cd backend
docker-compose up -d
```

This sets up a PostgreSQL container and the application container, linked appropriately.

## Testing

### Backend Testing

The project uses Testcontainers for integration tests with PostgreSQL. Tests load `test-schema.sql` and `test-data.sql` using @Sql.

Run unit and integration tests:

```bash
cd backend
mvn test
```

### Frontend Testing

To execute unit tests with Karma:

```bash
cd frontend
ng test
```

## Deployment

### Local Deployment

**Backend:**

```bash
cd backend
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

**Frontend:**

```bash
cd frontend
ng build --configuration=production
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