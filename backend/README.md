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
