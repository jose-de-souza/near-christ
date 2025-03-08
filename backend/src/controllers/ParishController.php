<?php

namespace App\Controllers;

use App\models\Parish;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ParishController
{
    /**
     * GET /parishes - Get all parishes (with diocese relationship)
     */
    public function getAll(Request $request, Response $response)
    {
        try {
            $parishes = Parish::with('diocese')->get();
            $response->getBody()->write(json_encode($parishes));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching parishes", $e);
        }
    }

    /**
     * GET /parishes/{id} - Get a single parish by ID (with diocese)
     */
    public function getById(Request $request, Response $response, $args)
    {
        try {
            $parish = Parish::with('diocese')->find($args['id']);
            if (!$parish) {
                return $this->notFoundResponse($response, "Parish not found");
            }
            $response->getBody()->write(json_encode($parish));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching parish", $e);
        }
    }

    /**
     * POST /parishes - Create a new parish (Protected by AuthMiddleware)
     */
    public function create(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody(), true);
            $parish = Parish::create($data);
            $response->getBody()->write(json_encode($parish));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error creating parish", $e);
        }
    }

    /**
     * PUT /parishes/{id} - Update a parish (Protected by AuthMiddleware)
     */
    public function update(Request $request, Response $response, $args)
    {
        try {
            $parish = Parish::find($args['id']);
            if (!$parish) {
                return $this->notFoundResponse($response, "Parish not found");
            }
            $data = json_decode($request->getBody(), true);
            $parish->update($data);
            $response->getBody()->write(json_encode($parish));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error updating parish", $e);
        }
    }

    /**
     * DELETE /parishes/{id} - Delete a parish (Protected by AuthMiddleware)
     */
    public function delete(Request $request, Response $response, $args)
    {
        try {
            $parish = Parish::find($args['id']);
            if (!$parish) {
                return $this->notFoundResponse($response, "Parish not found");
            }
            $parish->delete();
            return $response->withStatus(204); // No content response
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error deleting parish", $e);
        }
    }

    /**
     * Helper function for returning error responses
     */
    private function errorResponse(Response $response, string $message, \Exception $e)
    {
        $response->getBody()->write(json_encode(["error" => $message, "details" => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    /**
     * Helper function for returning not found responses
     */
    private function notFoundResponse(Response $response, string $message)
    {
        $response->getBody()->write(json_encode(["error" => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
}
