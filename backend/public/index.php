<?php

use Slim\Factory\AppFactory;
use Dotenv\Dotenv;
use App\Middlewares\CorsMiddleware;

require __DIR__ . '/../vendor/autoload.php';

// 1) Load environment variables
try {
    $dotenv = Dotenv::createImmutable(__DIR__ . '/../');
    $dotenv->load();
} catch (\Exception $e) {
    die("Error loading .env file: " . $e->getMessage());
}

// 2) Load database config (before using any models)
require __DIR__ . '/../src/config/database.php';

// 3) Create Slim app instance
$app = AppFactory::create();

// 4) Conditionally enable error reporting in development
if (isset($_ENV['APP_ENV']) && $_ENV['APP_ENV'] === 'development') {
    error_reporting(E_ALL);
    ini_set('display_errors', '1');
} else {
    error_reporting(0);
    ini_set('display_errors', '0');
}

// 5) Add built-in middleware for routing (if you use $request->getAttribute('route'))
$app->addRoutingMiddleware();

// 6) Add Slim’s error middleware (so errors are caught properly)
//    Then your custom CorsMiddleware will still attach CORS headers even on errors.
$errorMiddleware = $app->addErrorMiddleware(true, true, true);

// 7) Finally, add your custom CORS middleware LAST
//    so it wraps all responses (including 401, 500, etc.).
$app->add(CorsMiddleware::class);

// 8) Load all API routes
(require __DIR__ . '/../src/api/routes/routes.php')($app);

// 9) Run the application
$app->run();
