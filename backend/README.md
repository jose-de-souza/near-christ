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
c:\xampp\mysql\bin\mysql.exe -h "my-db-host" -P "my-db-port" -u "my-db-user" -p"my-db-pass" my-db-name
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

This ensures that  can safely run the DROP TABLE commands without foreign key errors and then recreate them in the correct dependency order.

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
### Generate the password Hash
```sh
php -r "echo password_hash('admin123', PASSWORD_BCRYPT).PHP_EOL;"
```
# 1) ADMIN user
```sh
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"admin@nearchrist.com\",\"password\":\"admin123\"}"
```

# 2) SUPERVISOR user
```sh
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"supervisor@nearchrist.com\",\"password\":\"super456\"}"
```

# 3) STANDARD user
```sh
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d "{\"email\":\"standard@nearchrist.com\",\"password\":\"std789\"}"
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
curl -X GET https://api.greatapps4you.us/dioceses -H "Accept: application/json"
```

### Get a diocese by ID
```sh
curl -X GET https://api.greatapps4you.us/dioceses/1 -H "Accept: application/json"
```

### Create a new diocese
```sh
curl -X POST https://api.greatapps4you.us/dioceses -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"DioceseName\":\"New Diocese\",\"DioceseStreetNo\":\"999\",\"DioceseStreetName\":\"Example St\",\"DioceseSuburb\":\"Newtown\",\"DioceseState\":\"NSW\",\"DiocesePostcode\":\"7000\",\"DiocesePhone\":\"(02) 8888 9999\",\"DioceseEmail\":\"contact@newdiocese.org\",\"DioceseWebsite\":\"www.newdiocese.org\"}"
```

### Update a diocese
```sh
curl -X PUT https://api.greatapps4you.us/dioceses/8 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"DioceseName\":\"Updated Diocese Name\"}"
```

### Delete a diocese
```sh
curl -X DELETE https://api.greatapps4you.us/dioceses/8 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE"
```

## Parish Endpoints
### Get all Parishes
```sh
curl -X GET https://api.greatapps4you.us/parishes -H "Accept: application/json"
```

### Get a parish by ID
```sh
curl -X GET https://api.greatapps4you.us/parishes/1 -H "Accept: application/json"
```

### Create a new parish
```sh
curl -X POST https://api.greatapps4you.us/parishes -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"ParishName\":\"New Parish\",\"ParishStNumber\":\"123\",\"ParishStName\":\"Main St\",\"ParishSuburb\":\"Downtown\",\"ParishState\":\"NSW\",\"ParishPostcode\":\"8000\",\"ParishPhone\":\"(02) 7777 7777\",\"ParishEmail\":\"contact@newparish.org\",\"ParishWebsite\":\"www.newparish.org\"}"
```

### Update a parish
```sh
curl -X PUT https://api.greatapps4you.us/parishes/1 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"ParishName\":\"Updated Parish Name\"}"
```

### Delete a parish
```sh
curl -X DELETE https://api.greatapps4you.us/parishes/1 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE"
```

## Adoration Endpoints
### Get all Adorations
```sh
curl -X GET https://api.greatapps4you.us/adorations -H "Accept: application/json"
```

### Get an Adoration by ID
```sh
curl -X GET https://api.greatapps4you.us/adorations/4 -H "Accept: application/json"
```

### Create a new Adoration
```sh
curl -X POST https://api.greatapps4you.us/adorations -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"DioceseID\":1,\"ParishID\":2,\"State\":\"NSW\",\"AdorationType\":\"Perpetual\",\"AdorationLocation\":\"Chapel\",\"AdorationLocationType\":\"Church\",\"AdorationDay\":\"Monday\",\"AdorationStart\":\"08:00:00\",\"AdorationEnd\":\"20:00:00\"}"
```

### Update an Adoration
```sh
curl -X PUT https://api.greatapps4you.us/adorations/4 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"AdorationType\":\"Regular\",\"AdorationLocation\":\"Main Church Hall\",\"AdorationDay\":\"Friday\"}"
```

### Delete an Adoration
```sh
curl -X DELETE https://api.greatapps4you.us/adorations/4 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE"
```

## Crusade Endpoints
### Get all Crusades
```sh
curl -X GET https://api.greatapps4you.us/crusades -H "Accept: application/json"
```

### Get a Crusade by ID
```sh
curl -X GET https://api.greatapps4you.us/crusades/2 -H "Accept: application/json"
```

### Create a new Crusade
```sh
curl -X POST https://api.greatapps4you.us/crusades -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"DioceseID\":1,\"ParishID\":2,\"State\":\"NSW\",\"CrusadeType\":\"Perpetual\",\"CrusadeLocation\":\"Chapel\",\"CrusadeLocationType\":\"Church\",\"CrusadeDay\":\"Monday\",\"CrusadeStart\":\"08:00:00\",\"CrusadeEnd\":\"20:00:00\"}"
```

### Update a Crusade
```sh
curl -X PUT https://api.greatapps4you.us/crusades/2 -H "Content-Type: application/json" -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE" -d "{\"CrusadeStartTime\":\"20:00:00\",\"CrusadeEndTime\":\"22:00:00\",\"Comments\":\"Updated crusade details.\"}"
```

### Delete a Crusade
```sh
curl -X DELETE https://api.greatapps4you.us/crusades/2 -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwOlwvXC9sb2NhbGhvc3QiLCJpYXQiOjE3NDE4Njk4NDYsImV4cCI6MTc0MTg3MzQ0Niwic3ViIjoiam9obndheW5lQGNvbXBhbnkuY29tIiwidXNlcl9pZCI6Nywicm9sZSI6InVzZXIifQ.lzMsihVPYXUjrn4IwZ6aQjN_cxCWUaU0gT9l1FZrTaE"
```


