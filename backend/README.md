# NEAR CHRIST BACKEND

## Starting a local server
```bash
cd backend
php -S localhost:8000 -t public
```

## Database
### Connecting to local MySQL
For the password just hit enter since it is blank.

```bash
c:\xampp\mysql\bin\mysql.exe mysql -u root -p
```

The order of DROP TABLE should follow the reverse order of creation, starting with the most dependent tables and ending with the base table.

### Drop tables in the correct order:
- Crusade first
- Adoration second
- Parish third
- Diocese last

### Create tables in the correct order:
- Diocese first (base table)
- Parish second (dependent on Diocese)
- Adoration third (dependent on Diocese and Parish)
- Crusade last (dependent on Diocese and Parish)

This ensures that you can safely run the DROP TABLE commands without foreign key errors and then recreate them in the correct dependency order.

## Composer
### Run compose require commands on the project root before commiting

### PHP 7.3 - 8.2
```bash
composer require slim/slim:^4.0 slim/psr7:^1.4 illuminate/database:^8.0
composer require firebase/php-jwt:^5.2 vlucas/phpdotenv
composer require --dev phpunit/phpunit
composer dump-autoload
```

## PHP 8.4
```bash
composer require slim/slim slim/psr7 illuminate/database
composer require firebase/php-jwt vlucas/phpdotenv
composer require --dev phpunit/phpunit
composer dump-autoload
```

## Git
### Commit
```bash
git add composer.json composer.lock
git commit -m "Added required dependencies"
```

### Remove unadvertedly commited sensitive files
```bash
git rm --cached -r vendor .env
git commit -m "Updated .gitignore to exclude sensitive files"
```

### After pulling code from GitHub, run:

```bash
composer install
```

### Before deployment, run:
```bash
composer install --no-dev --optimize-autoloader
```

## Test API
### Authentication

### Windows curl
```sh
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"johnwayne@company.com\",\"password\":\"1234\"}"
```

### Sample return
```json
{"accessToken":"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE2MzU3NTcsImV4cCI6MTc0MTYzOTM1Nywic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.6Bj71kZ8fQ6SzYBNm56tdHR9heih4-Tf6GgOuV1fCrw","user":{"id":7,"name":"John Wayne","email":"johnwayne@company.com"}}
```

## Security

### .env

```ini
APP_ENV=development
DB_HOST=127.0.0.1
DB_NAME=NEAR_CHRIST
DB_USER=root
DB_PASS=
JWT_SECRET_KEY=b57f579f7fb214aec11daab231ed641b13d5d1d348539a58a937b5b4c6bfaa7d
```

### Generating JWT_SECRET_KEY

### Unix
```bash
openssl rand -hex 32
```

### Windows
Use the Git Bash terminal and issue the name command above.

## Diocese Endpoints
### Get all dioceses
```sh
curl -X GET http://localhost:8000/dioceses -H "Accept: application/json"
```

### Get a diocese by ID
```sh
curl -X GET http://localhost:8000/dioceses/1 -H "Accept: application/json"
```

### Create a new diocese
```sh
curl -X POST http://localhost:8000/dioceses -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"DioceseName\":\"New Diocese\",\"DioceseStreetNo\":\"999\",\"DioceseStreetName\":\"Example St\",\"DioceseSuburb\":\"Newtown\",\"DioceseState\":\"NSW\",\"DiocesePostcode\":\"7000\",\"DiocesePhone\":\"(02) 8888 9999\",\"DioceseEmail\":\"contact@newdiocese.org\",\"DioceseWebsite\":\"www.newdiocese.org\"}"
```

### Update a diocese
```sh
curl -X PUT http://localhost:8000/dioceses/8 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"DioceseName\":\"Updated Diocese Name\"}"
```

### Delete a diocese
```sh
curl -X DELETE http://localhost:8000/dioceses/8 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ"
```

## Parish Endpoints
### Get all Parishes
```sh
curl -X GET http://localhost:8000/parishes -H "Accept: application/json"
```

### Get a parish by ID
```sh
curl -X GET http://localhost:8000/parishes/1 -H "Accept: application/json"
```

### Create a new parish
```sh
curl -X POST http://localhost:8000/parishes -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"ParishName\":\"New Parish\",\"ParishStNumber\":\"123\",\"ParishStName\":\"Main St\",\"ParishSuburb\":\"Downtown\",\"ParishState\":\"NSW\",\"ParishPostcode\":\"8000\",\"ParishPhone\":\"(02) 7777 7777\",\"ParishEmail\":\"contact@newparish.org\",\"ParishWebsite\":\"www.newparish.org\"}"
```

### Update a parish
```sh
curl -X PUT http://localhost:8000/parishes/1 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"ParishName\":\"Updated Parish Name\"}"
```

### Delete a parish
```sh
curl -X DELETE http://localhost:8000/parishes/1 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ"
```

## Adoration Endpoints
### Get all Adorations
```sh
curl -X GET http://localhost:8000/adorations -H "Accept: application/json"
```

### Get an Adoration by ID
```sh
curl -X GET http://localhost:8000/adorations/4 -H "Accept: application/json"
```

### Create a new Adoration
```sh
curl -X POST http://localhost:8000/adorations -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"DioceseID\":1,\"ParishID\":2,\"State\":\"NSW\",\"AdorationType\":\"Perpetual\",\"AdorationLocation\":\"Chapel\",\"AdorationLocationType\":\"Church\",\"AdorationDay\":\"Monday\",\"AdorationStart\":\"08:00:00\",\"AdorationEnd\":\"20:00:00\"}"
```

### Update an Adoration
```sh
curl -X PUT http://localhost:8000/adorations/4 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"AdorationType\":\"Regular\",\"AdorationLocation\":\"Main Church Hall\",\"AdorationDay\":\"Friday\"}"
```

### Delete an Adoration
```sh
curl -X DELETE http://localhost:8000/adorations/4 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ"
```

## Crusade Endpoints
### Get all Crusades
```sh
curl -X GET http://localhost:8000/crusades -H "Accept: application/json"
```

### Get a Crusade by ID
```sh
curl -X GET http://localhost:8000/crusades/2 -H "Accept: application/json"
```

### Create a new Crusade
```sh
curl -X POST http://localhost:8000/crusades -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"DioceseID\":1,\"ParishID\":2,\"State\":\"NSW\",\"CrusadeType\":\"Perpetual\",\"CrusadeLocation\":\"Chapel\",\"CrusadeLocationType\":\"Church\",\"CrusadeDay\":\"Monday\",\"CrusadeStart\":\"08:00:00\",\"CrusadeEnd\":\"20:00:00\"}"
```

### Update a Crusade
```sh
curl -X PUT http://localhost:8000/crusades/2 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ" -d "{\"CrusadeStartTime\":\"20:00:00\",\"CrusadeEndTime\":\"22:00:00\",\"Comments\":\"Updated crusade details.\"}"
```

### Delete a Crusade
```sh
curl -X DELETE http://localhost:8000/crusades/2 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE3MTYwMjEsImV4cCI6MTc0MTcxOTYyMSwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.5tVA8ntd6g0Ln9sBNw7q-h1YfqXpN89vOVRdAJo4NAQ"
```


