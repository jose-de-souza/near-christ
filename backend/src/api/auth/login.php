<?php

require __DIR__ . '/../../../vendor/autoload.php';

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Factory\AppFactory;
use Dotenv\Dotenv;

// Load environment variables
$dotenv = Dotenv::createImmutable(__DIR__ . '/../../../');
$dotenv->load();

// Create Slim App
$app = AppFactory::create();

/**
 * CORS Middleware
 */
$app->add(function ($request, $handler) {
    $response = $handler->handle($request);
    return $response->withHeader('Access-Control-Allow-Origin', '*')
                    ->withHeader('Content-Type', 'application/json')
                    ->withHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
                    ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
});

/**
 * Handle Preflight Requests (CORS)
 */
$app->options('/{routes:.+}', function (Request $request, Response $response, $args) {
    return $response;
});

/**
 * Login Route (JWT Authentication)
 */
$app->post('/auth/login', function (Request $request, Response $response) {
    $input = json_decode($request->getBody(), true);

    // Validate input
    if (!isset($input['email'], $input['password'])) {
        return $response->withStatus(400)->withJson(["error" => "Missing email or password"]);
    }

    // Hard-coded credentials (For Testing Only - Replace with DB validation)
    $validEmail = 'johnwayne@company.com';
    $validPassword = '1234';

    if ($input['email'] !== $validEmail || $input['password'] !== $validPassword) {
        return $response->withStatus(401)->withJson(["error" => "Invalid credentials"]);
    }

    // Generate JWT Token
    $secretKey = $_ENV['JWT_SECRET_KEY'] ?? null;
    if (!$secretKey) {
        return $response->withStatus(500)->withJson(["error" => "JWT_SECRET_KEY is missing"]);
    }

    $issuedAt = time();
    $expirationTime = $issuedAt + 3600; // 1-hour token validity
    $payload = [
        'iss' => $_ENV['APP_URL'] ?? 'http://localhost',
        'iat' => $issuedAt,
        'exp' => $expirationTime,
        'sub' => $validEmail,
        'user_id' => 7, // Example User ID
        'role' => 'user'
    ];

    try {
        $accessToken = JWT::encode($payload, $secretKey, 'HS256');
    } catch (Exception $e) {
        return $response->withStatus(500)->withJson(["error" => "JWT encoding failed", "details" => $e->getMessage()]);
    }

    // Return the response with the token
    $response->getBody()->write(json_encode([
        "accessToken" => $accessToken,
        "user" => [
            "id" => 7,
            "name" => "John Wayne",
            "email" => $validEmail
        ]
    ]));
    return $response->withHeader('Content-Type', 'application/json');
});

/**
 * Run Slim App
 */
$app->run();
