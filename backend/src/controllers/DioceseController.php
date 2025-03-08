<?php

namespace App\Controllers;

use App\models\Diocese;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class DioceseController {

    /**
     * GET /dioceses - Get all dioceses (including related parishes)
     */
    public function getAll(Request $request, Response $response) {
        try {
            $dioceses = Diocese::with('parishes')->get();
            $response->getBody()->write(json_encode($dioceses));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching dioceses", $e);
        }
    }

    /**
     * GET /dioceses/{id} - Get a single diocese by ID (including related parishes)
     */
    public function getById(Request $request, Response $response, $args) {
        try {
            $diocese = Diocese::with('parishes')->find($args['id']);
            if (!$diocese) {
                return $this->notFoundResponse($response, "Diocese not found");
            }
            $response->getBody()->write(json_encode($diocese));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching diocese", $e);
        }
    }

    /**
     * POST /dioceses - Create a new diocese (Protected by AuthMiddleware)
     */
    public function create(Request $request, Response $response) {
        try {
            $data = json_decode($request->getBody(), true);
            $diocese = Diocese::create($data);
            $response->getBody()->write(json_encode($diocese));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error creating diocese", $e);
        }
    }

    /**
     * PUT /dioceses/{id} - Update a diocese (Protected by AuthMiddleware)
     */
    public function update(Request $request, Response $response, $args) {
        try {
            $diocese = Diocese::find($args['id']);
            if (!$diocese) {
                return $this->notFoundResponse($response, "Diocese not found");
            }
            $data = json_decode($request->getBody(), true);
            $diocese->update($data);
            $response->getBody()->write(json_encode($diocese));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error updating diocese", $e);
        }
    }

    /**
     * DELETE /dioceses/{id} - Delete a diocese (Protected by AuthMiddleware)
     */
    public function delete(Request $request, Response $response, $args) {
        try {
            $diocese = Diocese::find($args['id']);
            if (!$diocese) {
                return $this->notFoundResponse($response, "Diocese not found");
            }
            $diocese->delete();
            return $response->withStatus(204); // No content response
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error deleting diocese", $e);
        }
    }

    /**
     * Helper function for returning error responses
     */
    private function errorResponse(Response $response, string $message, \Exception $e) {
        $response->getBody()->write(json_encode(["error" => $message, "details" => $e->getMessage()]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(500);
    }

    /**
     * Helper function for returning not found responses
     */
    private function notFoundResponse(Response $response, string $message) {
        $response->getBody()->write(json_encode(["error" => $message]));
        return $response->withHeader('Content-Type', 'application/json')->withStatus(404);
    }
}