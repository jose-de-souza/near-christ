<?php

use Slim\Factory\AppFactory;
use Dotenv\Dotenv;
use App\Middlewares\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// Load environment variables from .env file
$dotenv = Dotenv::createImmutable(__DIR__ . '/../');
$dotenv->load();

// Create Slim app instance
$app = AppFactory::create();

// Enable error reporting in development
if ($_ENV['APP_ENV'] === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// Load CORS Middleware
$app->add(new CorsMiddleware());

// Load API Routes
(require __DIR__ . '/../src/api/routes/routes.php')($app);

// Handle CORS preflight requests
$app->options('/{routes:.+}', function ($request, $response, $args) {
    return $response;
});

// Run the app
$app->run();
