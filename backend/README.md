# Backend (Clojure)

The Backend is a Clojure application providing RESTful APIs for managing dioceses, parishes, adorations, crusades, and users, with JWT-based authentication and role-based access control. This is a migration from Java/Spring Boot, preserving the same API contracts for the Angular frontend.

## About The Project

This is a full-stack web application called "Near Christ", a service of the Australian Medjugorje Centre. It manages Catholic dioceses, parishes, adoration schedules, and rosary crusades.

### Project Architecture

- **Backend:** RESTful API in Clojure with Reitit, next.jdbc, Buddy (JWT/Bcrypt).
- **Frontend:** Angular SPA (unchanged).

### Backend Features

- **Technologies:**
    - Clojure 1.11.1
    - Leiningen
    - next.jdbc + HikariCP (DB)
    - PostgreSQL
    - Flyway (migrations)
    - Buddy (JWT, Bcrypt)
    - Cheshire (JSON)
    - http-kit (server)
    - Docker

- **Functionality:**
    - **Authentication:** `/auth/login` issues JWT.
    - **CRUD:** Endpoints for States, Dioceses, Parishes, Adorations, Crusades, Users, Roles.
    - **RBAC:** Roles (ADMIN, SUPERVISOR, STANDARD) via JWT claims.

## Prerequisites

- Clojure 1.11+ and Leiningen
- PostgreSQL 14+
- Docker (optional, for containerization)

## Project Setup

### Clone the Repository

```bash
git clone <repository-url>
cd backend