<?php

namespace App\Controllers;

use App\Models\User;
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
    public function login(Request $request, Response $response): Response
    {
        $input = json_decode($request->getBody(), true);

        // Validate input
        if (!isset($input['email'], $input['password'])) {
            return $this->jsonResponse($response, 400, false, "Missing email or password");
        }

        // Look up user by email in DB
        $user = User::where('UserEmail', $input['email'])->first();
        if (!$user) {
            return $this->jsonResponse($response, 401, false, "Invalid credentials");
        }

        // Verify hashed password
        if (!password_verify($input['password'], $user->UserPassword)) {
            return $this->jsonResponse($response, 401, false, "Invalid credentials");
        }

        // Generate JWT token
        $secretKey = $_ENV['JWT_SECRET_KEY'] ?? null;
        if (!$secretKey) {
            return $this->jsonResponse($response, 500, false, "JWT_SECRET_KEY is missing");
        }

        $issuedAt       = time();
        $expirationTime = $issuedAt + 3600; // 1 hour validity
        $payload = [
            'iss'     => $_ENV['APP_URL'] ?? 'http://localhost',
            'iat'     => $issuedAt,
            'exp'     => $expirationTime,
            'sub'     => $user->UserEmail,  // subject => user's email
            'user_id' => $user->UserID,
            'role'    => $user->UserRole
        ];

        try {
            $accessToken = JWT::encode($payload, $secretKey, 'HS256');
        } catch (Exception $e) {
            return $this->jsonResponse($response, 500, false, "JWT encoding failed", [
                "details" => $e->getMessage()
            ]);
        }

        // Return response with JWT token and user info
        return $this->jsonResponse($response, 200, true, "Login successful", [
            "accessToken" => $accessToken,
            "user" => [
                "id"    => $user->UserID,
                "name"  => $user->UserName,
                "email" => $user->UserEmail,
                "role"  => $user->UserRole
            ]
        ]);
    }

    /**
     * Utility function to create a JSON response
     */
    private function jsonResponse(Response $response, int $status, bool $success, string $message, array $data = []): Response
    {
        $payload = [
            "success" => $success,
            "status"  => $status,
            "message" => $message,
            "data"    => $data
        ];

        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
