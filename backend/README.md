# NEAR CHRIST BACKEND

## Database

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

### Unix curl
```bash
curl -X POST http://localhost:8000/auth/login -H "Content-Type: application/json" -d '{"email":"johnwayne@company.com","password":"1234"}'
```

### Windows curl
```bat
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