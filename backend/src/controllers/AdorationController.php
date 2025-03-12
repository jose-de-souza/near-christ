<?php

namespace App\Controllers;

use App\Models\Adoration;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdorationController
{
    /**
     * GET /adorations - Get all adorations (with related diocese and parish)
     */
    public function getAll(Request $request, Response $response)
    {
        try {
            $query = Adoration::with(['diocese', 'parish']);

            $params = $request->getQueryParams();
            $state     = $params['state']       ?? null;
            $dioceseID = $params['diocese_id']  ?? null;
            $parishID  = $params['parish_id']   ?? null;

            if ($state && $state !== 'null') {
                $query->where('State', $state);
            }
            if ($dioceseID && $dioceseID !== 'null') {
                $query->where('DioceseID', $dioceseID);
            }
            if ($parishID && $parishID !== 'null') {
                $query->where('ParishID', $parishID);
            }

            $adorations = $query->get();
            $response->getBody()->write(json_encode($adorations));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching adorations", $e);
        }
    }

    /**
     * GET /adorations/{id} - Get a single adoration by ID (with related diocese and parish)
     */
    public function getById(Request $request, Response $response, $args)
    {
        try {
            $adoration = Adoration::with(['diocese', 'parish'])->find($args['id']);
            if (!$adoration) {
                return $this->notFoundResponse($response, "Adoration not found");
            }
            $response->getBody()->write(json_encode($adoration));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching adoration", $e);
        }
    }

    /**
     * POST /adorations - Create a new adoration (Protected by AuthMiddleware)
     */
    public function create(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody(), true);
            $adoration = Adoration::create($data);
            $response->getBody()->write(json_encode($adoration));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error creating adoration", $e);
        }
    }

    /**
     * PUT /adorations/{id} - Update an adoration (Protected by AuthMiddleware)
     */
    public function update(Request $request, Response $response, $args)
    {
        try {
            $adoration = Adoration::find($args['id']);
            if (!$adoration) {
                return $this->notFoundResponse($response, "Adoration not found");
            }
            $data = json_decode($request->getBody(), true);
            $adoration->update($data);
            $response->getBody()->write(json_encode($adoration));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error updating adoration", $e);
        }
    }

    /**
     * DELETE /adorations/{id} - Delete an adoration (Protected by AuthMiddleware)
     */
    public function delete(Request $request, Response $response, $args)
    {
        try {
            $adoration = Adoration::find($args['id']);
            if (!$adoration) {
                return $this->notFoundResponse($response, "Adoration not found");
            }
            $adoration->delete();
            return $response->withStatus(204); // No content response
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error deleting adoration", $e);
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
