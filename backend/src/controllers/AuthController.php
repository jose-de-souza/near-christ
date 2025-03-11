<?php

namespace App\Controllers;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Response as SlimResponse;
use Exception;

class AuthController
{
    /**
     * Handle POST /auth/login
     */
    public function login(Request $request, Response $response): Response
    {
        $input = json_decode($request->getBody(), true);

        // Validate input
        if (!isset($input['email'], $input['password'])) {
            return $this->jsonResponse($response, 400, false, "Missing email or password");
        }

        // Hard-coded credentials (FOR TESTING ONLY - Replace with DB validation)
        $validEmail = 'johnwayne@company.com';
        $validPassword = '1234';

        if ($input['email'] !== $validEmail || $input['password'] !== $validPassword) {
            return $this->jsonResponse($response, 401, false, "Invalid credentials");
        }

        // Generate JWT token
        $secretKey = $_ENV['JWT_SECRET_KEY'] ?? null;
        if (!$secretKey) {
            return $this->jsonResponse($response, 500, false, "JWT_SECRET_KEY is missing");
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
            return $this->jsonResponse($response, 500, false, "JWT encoding failed", ["details" => $e->getMessage()]);
        }

        // Return response with JWT token
        return $this->jsonResponse($response, 200, true, "Login successful", [
            "accessToken" => $accessToken,
            "user" => [
                "id" => 7,
                "name" => "John Wayne",
                "email" => $validEmail
            ]
        ]);
    }

    /**
     * Utility function to create a JSON response
     */
    private function jsonResponse(Response $response, int $status, bool $success, string $message, array $data = []): Response
    {
        $response->getBody()->write(json_encode([
            "success" => $success,
            "status" => $status,
            "message" => $message,
            "data" => $data
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
