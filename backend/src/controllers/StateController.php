<?php

namespace App\Controllers;

use App\Models\State;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class StateController
{
    /**
     * GET /states - Get all States (optionally including related Dioceses)
     */
    public function getAll(Request $request, Response $response)
    {
        try {
            // If you want the related dioceses: State::with('dioceses')->get();
            $states = State::all();
            $response->getBody()->write(json_encode($states));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching states", $e);
        }
    }

    /**
     * GET /states/{id} - Get a single State by ID (optionally with 'dioceses')
     */
    public function getById(Request $request, Response $response, $args)
    {
        try {
            // If you want to load related dioceses => with('dioceses')->find()
            $state = State::find($args['id']);
            if (!$state) {
                return $this->notFoundResponse($response, "State not found");
            }
            $response->getBody()->write(json_encode($state));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching state", $e);
        }
    }

    /**
     * POST /states - Create a new State
     * (Protected by AuthMiddleware, presumably)
     */
    public function create(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody(), true);
            $state = State::create($data);
            $response->getBody()->write(json_encode($state));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error creating state", $e);
        }
    }

    /**
     * PUT /states/{id} - Update a State
     */
    public function update(Request $request, Response $response, $args)
    {
        try {
            $state = State::find($args['id']);
            if (!$state) {
                return $this->notFoundResponse($response, "State not found");
            }
            $data = json_decode($request->getBody(), true);
            $state->update($data);
            $response->getBody()->write(json_encode($state));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error updating state", $e);
        }
    }

    /**
     * DELETE /states/{id} - Delete a State
     */
    public function delete(Request $request, Response $response, $args)
    {
        try {
            $state = State::find($args['id']);
            if (!$state) {
                return $this->notFoundResponse($response, "State not found");
            }
            $state->delete();
            return $response->withStatus(204); // No content
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error deleting state", $e);
        }
    }

    /**
     * Helper: return a JSON error
     */
    private function errorResponse(Response $response, string $message, \Exception $e)
    {
        $response->getBody()->write(json_encode([
            "error" => $message,
            "details" => $e->getMessage()
        ]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    }

    /**
     * Helper: return a JSON 404
     */
    private function notFoundResponse(Response $response, string $message)
    {
        $response->getBody()->write(json_encode(["error" => $message]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(404);
    }
}
