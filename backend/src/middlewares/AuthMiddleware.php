<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;
use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Exception;

class AuthMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        $authHeader = $request->getHeaderLine('Authorization');

        // Validate Authorization header format
        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $this->unauthorizedResponse("Missing or invalid token");
        }

        $jwt = $matches[1];

        try {
            $secretKey = $_ENV['JWT_SECRET_KEY'] ?? null;
            if (!$secretKey) {
                return $this->unauthorizedResponse("JWT_SECRET_KEY is not set");
            }

            // Decode JWT token
            $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
            $userData = (array) $decoded; // Convert JWT object to array

            // Attach user data to the request
            $request = $request->withAttribute('user', $userData);
        } catch (Exception $e) {
            return $this->unauthorizedResponse("Invalid token: " . $e->getMessage());
        }

        // Proceed with the next middleware
        return $handler->handle($request);
    }

    /**
     * Returns a formatted unauthorized response.
     */
    private function unauthorizedResponse(string $message): Response
    {
        $response = new SlimResponse();
        $response->getBody()->write(json_encode([
            "success" => false,
            "status" => 401,
            "message" => $message
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json')->withStatus(401);
    }
}
