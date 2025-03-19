<?php

namespace App\Middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Response as SlimResponse;

/**
 * CorsMiddleware adds CORS headers to all requests (including OPTIONS).
 */
class CorsMiddleware
{
    public function __invoke(Request $request, $handler): Response
    {
        // (1) For OPTIONS requests, short-circuit with 200 + CORS headers
        if ($request->getMethod() === 'OPTIONS') {
            $emptyResponse = new SlimResponse();
            return $this->withCorsHeaders($emptyResponse)
                ->withStatus(200);
        }

        // (2) For all other requests, proceed, then attach CORS headers
        $response = $handler->handle($request);
        return $this->withCorsHeaders($response);
    }

    private function withCorsHeaders(Response $response): Response
    {
        // If you need cross-site cookies or Authorization headers,
        // you can't use "*" with credentials:
        // ->withHeader('Access-Control-Allow-Origin', 'http://localhost:4200')
        // ->withHeader('Access-Control-Allow-Credentials', 'true')

        // If you don't need credentials, you can keep "*" and remove the credentials line.
        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->withHeader('Access-Control-Allow-Credentials', 'true');
    }
}
