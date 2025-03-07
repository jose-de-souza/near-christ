<?php

use Illuminate\Database\Capsule\Manager as Capsule;
use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../..');
$dotenv->load();

// Initialize Eloquent ORM (Capsule)
$capsule = new Capsule;
$capsule->addConnection([
    'driver'    => 'mysql',
    'host'      => $_ENV['DB_HOST'] ?? '127.0.0.1',
    'database'  => $_ENV['DB_NAME'] ?? 'near_christ',
    'username'  => $_ENV['DB_USER'] ?? 'root',
    'password'  => $_ENV['DB_PASS'] ?? '',
    'charset'   => 'utf8',
    'collation' => 'utf8_unicode_ci',
    'prefix'    => '',
]);

// Make the Capsule instance globally available
$capsule->setAsGlobal();
$capsule->bootEloquent();

// Enable Query Logging (for debugging in development mode)
if ($_ENV['APP_ENV'] === 'development') {
    $capsule->getConnection()->enableQueryLog();
}
