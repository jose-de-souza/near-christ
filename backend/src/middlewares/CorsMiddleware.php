<?php

namespace App\middlewares;

use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CorsMiddleware {
    public function __invoke(Request $request, $handler): Response {
        $response = $handler->handle($request);

        return $response->withHeader('Access-Control-Allow-Origin', '*')  // Allow all origins (*). Change to specific domain for production.
                        ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
                        ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
                        ->withHeader('Access-Control-Allow-Credentials', 'true');
    }
}
