<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Psr\Http\Server\RequestHandlerInterface as RequestHandler;
use Slim\Psr7\Response as SlimResponse;

/**
 * RoleMiddleware checks the user's role (from AuthMiddleware) and
 * allows/denies requests based on your specified rules:
 *
 * - ADMIN: can do anything
 * - SUPERVISOR: can do anything but manage Users
 * - STANDARD: can do anything but delete records
 */
class RoleMiddleware
{
    public function __invoke(Request $request, RequestHandler $handler): Response
    {
        // We expect AuthMiddleware to have already attached user data to the request
        $user = $request->getAttribute('user');
        if (!$user) {
            return $this->forbiddenResponse("No user data found in token.");
        }

        $role = $user['role'] ?? null;   // e.g., ADMIN, SUPERVISOR, STANDARD
        $method = $request->getMethod(); // GET, POST, PUT, DELETE, etc.
        $path   = $request->getUri()->getPath(); // e.g. "/parishes", "/users", etc.

        // 1) If user is ADMIN => no restrictions
        if ($role === 'ADMIN') {
            return $handler->handle($request);
        }

        // 2) If user is SUPERVISOR => can do anything except manage Users
        //    (i.e. can't create/update/delete user).
        //    If your app has a route like "/users" or "/auth/users" for user mgmt,
        //    you can deny it here:
        if ($role === 'SUPERVISOR') {
            // Example: if route starts with "/users", forbid any method that modifies them
            // (POST, PUT, DELETE).
            if (preg_match('/^\/users/i', $path) && in_array($method, ['POST', 'PUT', 'DELETE'])) {
                return $this->forbiddenResponse("SUPERVISOR cannot manage users.");
            }
            // Otherwise, allow
            return $handler->handle($request);
        }

        // 3) If user is STANDARD => can do anything except DELETE records
        if ($role === 'STANDARD') {
            // If it's a DELETE request, deny
            if ($method === 'DELETE') {
                return $this->forbiddenResponse("STANDARD user cannot delete records.");
            }
            // Otherwise, allow
            return $handler->handle($request);
        }

        // Unknown or missing role
        return $this->forbiddenResponse("Unknown user role or role not set.");
    }

    /**
     * Helper to return a 403 Forbidden JSON response
     */
    private function forbiddenResponse(string $message): Response
    {
        $response = new SlimResponse();
        $response->getBody()->write(json_encode([
            "success" => false,
            "status"  => 403,
            "message" => $message
        ], JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

        return $response->withHeader('Content-Type', 'application/json')
            ->withStatus(403);
    }
}
