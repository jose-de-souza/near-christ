<?php

namespace App\Controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Exception;

class AuthController
{
    /**
     * Handle POST /auth/login
     */
    public function login(Request $request, Response $response)
    {
        $input = json_decode($request->getBody(), true);

        // Validate input
        if (!isset($input['email'], $input['password'])) {
            $response->getBody()->write(json_encode(["error" => "Missing email or password"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(400);
        }

        // Hard-coded credentials (FOR TESTING ONLY - Replace with DB validation)
        $validEmail = 'johnwayne@company.com';
        $validPassword = '1234';

        if ($input['email'] !== $validEmail || $input['password'] !== $validPassword) {
            $response->getBody()->write(json_encode(["error" => "Invalid credentials"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
        }

        // Generate JWT token
        $secretKey = $_ENV['JWT_SECRET_KEY'] ?? null;
        if (!$secretKey) {
            $response->getBody()->write(json_encode(["error" => "JWT_SECRET_KEY is missing"]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }

        $issuedAt = time();
        $expirationTime = $issuedAt + 3600; // 1 hour validity
        $payload = [
            'iss' => $_ENV['APP_URL'] ?? 'http://localhost',
            'iat' => $issuedAt,
            'exp' => $expirationTime,
            'sub' => $validEmail,
            'user_id' => 7, // Example user ID
            'role' => 'user'
        ];

        try {
            $accessToken = JWT::encode($payload, $secretKey, 'HS256');
        } catch (Exception $e) {
            $response->getBody()->write(json_encode([
                "error" => "JWT encoding failed",
                "details" => $e->getMessage()
            ]));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
        }

        // Return response with JWT token
        $response->getBody()->write(json_encode([
            "accessToken" => $accessToken,
            "user" => [
                "id" => 7,
                "name" => "John Wayne",
                "email" => $validEmail
            ]
        ]));

        return $response->withHeader('Content-Type', 'application/json');
    }
}
