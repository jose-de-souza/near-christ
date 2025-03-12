<?php

use Slim\App;
use Slim\Routing\RouteCollectorProxy;
use App\Controllers\AuthController;
use App\Controllers\AdorationController;
use App\Controllers\CrusadeController;
use App\Controllers\DioceseController;
use App\Controllers\ParishController;
use App\Middlewares\AuthMiddleware;

return function (App $app) {

    /**
     * Allow OPTIONS FOR ALL ROUTES
     */
    $app->options('/{routes:.+}', function ($request, $response, $args) {
        return $response;
    });

    /**
     * AUTH CONTROLLER
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
     * PROTECTED ROUTES (Require JWT Authentication)
     */
    $app->group('', function (RouteCollectorProxy $group) {
        // Diocese routes
        $group->post('/dioceses', [DioceseController::class, 'create']);
        $group->put('/dioceses/{id}', [DioceseController::class, 'update']);
        $group->delete('/dioceses/{id}', [DioceseController::class, 'delete']);

        // Parish routes
        $group->post('/parishes', [ParishController::class, 'create']);
        $group->put('/parishes/{id}', [ParishController::class, 'update']);
        $group->delete('/parishes/{id}', [ParishController::class, 'delete']);

        // Adoration routes
        $group->post('/adorations', [AdorationController::class, 'create']);
        $group->put('/adorations/{id}', [AdorationController::class, 'update']);
        $group->delete('/adorations/{id}', [AdorationController::class, 'delete']);

        // Crusade routes
        $group->post('/crusades', [CrusadeController::class, 'create']);
        $group->put('/crusades/{id}', [CrusadeController::class, 'update']);
        $group->delete('/crusades/{id}', [CrusadeController::class, 'delete']);
    })->add(new AuthMiddleware());
};
