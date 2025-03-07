<?php

namespace App\Middlewares;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Exception\HttpUnauthorizedException;

class AuthMiddleware {
    public function __invoke(Request $request, Response $response, $next) {
        $authHeader = $request->getHeaderLine('Authorization');

        if (!$authHeader || !preg_match('/Bearer\s(\S+)/', $authHeader, $matches)) {
            return $this->unauthorizedResponse($response, "Missing or malformed token");
        }

        $jwt = $matches[1]; // Extract the token

        try {
            $secretKey = getenv('JWT_SECRET_KEY');
            if (!$secretKey) {
                return $this->unauthorizedResponse($response, "JWT secret key is missing");
            }

            // Decode and validate JWT
            $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));

            // Add decoded user data to request
            $request = $request->withAttribute('user', $decoded);

            // Pass to next middleware or controller
            return $next->handle($request);

        } catch (\Exception $e) {
            return $this->unauthorizedResponse($response, "Invalid or expired token: " . $e->getMessage());
        }
    }

    private function unauthorizedResponse(Response $response, string $message) {
        $response->getBody()->write(json_encode(["error" => $message]));
        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus(401);
    }
}
