<?php

use Slim\App;
use App\Controllers\DioceseController;
use App\Middlewares\AuthMiddleware;

return function (App $app) {

    // Public Routes (No Authentication Required)
    $app->get('/dioceses', DioceseController::class . ':getAll'); // Get all dioceses
    $app->get('/dioceses/{id}', DioceseController::class . ':getById'); // Get diocese by ID

    // Protected Routes (Require JWT Authentication)
    $app->group('/dioceses', function ($group) {
        $group->post('', DioceseController::class . ':create'); // Create new diocese
        $group->put('/{id}', DioceseController::class . ':update'); // Update existing diocese
        $group->delete('/{id}', DioceseController::class . ':delete'); // Delete a diocese
    })->add(new AuthMiddleware());

    // Handle Preflight Requests for CORS
    $app->options('/{routes:.+}', function ($request, $response, $args) {
        return $response;
    });
};
