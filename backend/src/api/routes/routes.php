<?php

use Slim\App;
use App\Controllers\AuthController;
use App\Controllers\AdorationController;
use App\Controllers\CrusadeController;
use App\Controllers\DioceseController;
use App\Controllers\ParishController;
use App\Middlewares\AuthMiddleware;

return function (App $app) {

    /**
     * AUTH CONTROLLER
     * POST /auth/login
     */
    $app->post('/auth/login', [AuthController::class, 'login']);

    /**
     * ADORATION CONTROLLER
     */
    // Public
    $app->get('/adorations', [AdorationController::class, 'getAll']);
    $app->get('/adorations/{id}', [AdorationController::class, 'getById']);

    // Protected
    $app->post('/adorations', [AdorationController::class, 'create'])->add(AuthMiddleware::class);
    $app->put('/adorations/{id}', [AdorationController::class, 'update'])->add(AuthMiddleware::class);
    $app->delete('/adorations/{id}', [AdorationController::class, 'delete'])->add(AuthMiddleware::class);

    /**
     * CRUSADE CONTROLLER
     */
    // Public
    $app->get('/crusades', [CrusadeController::class, 'getAll']);
    $app->get('/crusades/{id}', [CrusadeController::class, 'getById']);

    // Protected
    $app->post('/crusades', [CrusadeController::class, 'create'])->add(AuthMiddleware::class);
    $app->put('/crusades/{id}', [CrusadeController::class, 'update'])->add(AuthMiddleware::class);
    $app->delete('/crusades/{id}', [CrusadeController::class, 'delete'])->add(AuthMiddleware::class);

    /**
     * DIOCESE CONTROLLER
     */
    // Public
    $app->get('/dioceses', [DioceseController::class, 'getAll']);
    $app->get('/dioceses/{id}', [DioceseController::class, 'getById']);

    // Protected
    $app->post('/dioceses', [DioceseController::class, 'create'])->add(AuthMiddleware::class);
    $app->put('/dioceses/{id}', [DioceseController::class, 'update'])->add(AuthMiddleware::class);
    $app->delete('/dioceses/{id}', [DioceseController::class, 'delete'])->add(AuthMiddleware::class);

    /**
     * PARISH CONTROLLER
     */
    // Public
    $app->get('/parishes', [ParishController::class, 'getAll']);
    $app->get('/parishes/{id}', [ParishController::class, 'getById']);

    // Protected
    $app->post('/parishes', [ParishController::class, 'create'])->add(AuthMiddleware::class);
    $app->put('/parishes/{id}', [ParishController::class, 'update'])->add(AuthMiddleware::class);
    $app->delete('/parishes/{id}', [ParishController::class, 'delete'])->add(AuthMiddleware::class);

    /**
     * Handle CORS Preflight Requests
     */
    $app->options('/{routes:.+}', function ($request, $response, $args) {
        return $response;
    });
};
