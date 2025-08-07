# Near Christ Frontend

This project is the Angular frontend for the Near Christ application, a service of the Australian Medjugorje Centre. It provides a user interface for querying and managing Catholic dioceses, parishes, adoration schedules, and rosary crusades.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 19.2.0.

## Core Technologies

  * **Angular:** A component-based framework for building the user interface.
  * **TypeScript:** The primary language for the frontend code.
  * **Angular Material:** A UI component library for a consistent and modern look and feel.
  * **SCSS:** For styling the application.
  * **RxJS:** For reactive programming and managing asynchronous operations.

## Features

### Public Views

  * **Adoration Query:** Allows users to search for adoration schedules based on state, diocese, and parish.
  * **Crusade Query:** Allows users to search for rosary crusades based on state, diocese, and parish.

### Authenticated Views

These views require users to be logged in and have the appropriate permissions:

  * **Adoration Schedule Management:** Create, update, and delete adoration schedules.
  * **Diocese Maintenance:** Manage diocesan information.
  * **Parish Maintenance:** Manage parish information.
  * **Rosary Crusade Management:** Manage rosary crusade events.
  * **User Maintenance:** (ADMIN only) Manage application users and their roles.

### UI Features

  * **Drag-and-Drop Tables:** Users can reorder columns in the data tables.
  * **Snackbar Notifications:** The application uses Angular Material's Snackbar to provide feedback to the user (e.g., success, warning, and error messages).
  * **Confirmation Dialogs:** A confirmation dialog is used for destructive actions like deleting a record.

## Prerequisites

  * Node.js and npm
  * Angular CLI

## Getting Started

1.  **Install Dependencies:**

    ```bash
    npm install
    ```

2.  **Run the Development Server:**

    ```bash
    ng serve --open
    ```

    Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Building for Production

To build the project for production, run:

```sh
ng build --configuration=production
```

The build artifacts will be stored in the `dist/` directory.

## Code Scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Testing

To execute the unit tests via [Karma](https://karma-runner.github.io), run:

```bash
ng test
```

## Environment Configuration

The application's environment configuration is managed in the `src/environments/` directory.

  * `environment.ts`: Used for development.
  * `environment.prod.ts`: Used for production builds.

The `apiUrl` property in these files should be configured to point to the backend API.