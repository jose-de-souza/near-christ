<?php

use Slim\Factory\AppFactory;
use Dotenv\Dotenv;
use App\middlewares\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables safely
try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (\Exception $e) {
    die("Error loading .env file: " . $e->getMessage());
}

// Create Slim app instance
$app = AppFactory::create();

// Enable error reporting in development mode
if ($_ENV['APP_ENV'] === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Register Middlewares
$app->add(CorsMiddleware::class);

// Load API Routes
(require __DIR__ . '/../src/api/routes/routes.php')($app);

// Run the application
$app->run();
