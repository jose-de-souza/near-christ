<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Controllers\AuthController;
use App\Controllers\UserController;
use App\Controllers\AdorationController;
use App\Controllers\CrusadeController;
use App\Controllers\DioceseController;
use App\Controllers\ParishController;
use App\Middlewares\AuthMiddleware;
use App\Middlewares\RoleMiddleware;

return function (App $app) {

    /**
     * 1) Attach CORS headers for every response (including errors).
     *    This runs for ALL routes, so the browser never blocks requests.
     */
    $app->add(function ($request, $handler) {
        $response = $handler->handle($request);

        // Adjust these lines as needed:
        return $response
            ->withHeader('Access-Control-Allow-Origin', '*')
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization')
            ->withHeader('Access-Control-Allow-Credentials', 'true');
    });

    /**
     * 2) Allow OPTIONS for all routes.
     *    This ensures the browser’s preflight request sees valid CORS headers.
     */
    $app->options('/{routes:.+}', function ($request, $response, $args) {
        // Return a 200 with CORS headers (already attached above).
        return $response->withStatus(200);
    });

    /**
     * AUTH CONTROLLER (Public)
     */
    $app->post('/auth/login', [AuthController::class, 'login']);

    /**
     * PUBLIC ROUTES (Unprotected)
     */
    // Diocese
    $app->get('/dioceses', [DioceseController::class, 'getAll']);
    $app->get('/dioceses/{id}', [DioceseController::class, 'getById']);

    // Parish
    $app->get('/parishes', [ParishController::class, 'getAll']);
    $app->get('/parishes/{id}', [ParishController::class, 'getById']);

    // Adoration
    $app->get('/adorations', [AdorationController::class, 'getAll']);
    $app->get('/adorations/{id}', [AdorationController::class, 'getById']);

    // Crusade
    $app->get('/crusades', [CrusadeController::class, 'getAll']);
    $app->get('/crusades/{id}', [CrusadeController::class, 'getById']);

    /**
     * PROTECTED ROUTES (Require JWT Authentication, Then Role Check)
     */
    $app->group('', function (RouteCollectorProxy $group) {

        // Diocese
        $group->post('/dioceses', [DioceseController::class, 'create']);
        $group->put('/dioceses/{id}', [DioceseController::class, 'update']);
        $group->delete('/dioceses/{id}', [DioceseController::class, 'delete']);

        // Parish
        $group->post('/parishes', [ParishController::class, 'create']);
        $group->put('/parishes/{id}', [ParishController::class, 'update']);
        $group->delete('/parishes/{id}', [ParishController::class, 'delete']);

        // Adoration
        $group->post('/adorations', [AdorationController::class, 'create']);
        $group->put('/adorations/{id}', [AdorationController::class, 'update']);
        $group->delete('/adorations/{id}', [AdorationController::class, 'delete']);

        // Crusade
        $group->post('/crusades', [CrusadeController::class, 'create']);
        $group->put('/crusades/{id}', [CrusadeController::class, 'update']);
        $group->delete('/crusades/{id}', [CrusadeController::class, 'delete']);

        // User
        $group->get('/users', [UserController::class, 'getAll']);
        $group->get('/users/{id}', [UserController::class, 'getById']);
        $group->post('/users', [UserController::class, 'create']);
        $group->put('/users/{id}', [UserController::class, 'update']);
        $group->delete('/users/{id}', [UserController::class, 'delete']);
    })
        // Order matters: AuthMiddleware runs first (decodes token),
        // then RoleMiddleware runs next (checks user role).
        ->add(new RoleMiddleware())
        ->add(new AuthMiddleware());
};