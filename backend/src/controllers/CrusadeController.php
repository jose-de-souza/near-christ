<?php

namespace App\Controllers;

use App\Models\Crusade;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CrusadeController
{
    /**
     * GET /crusades
     * Return all crusades (with related diocese and parish), optionally filtered.
     */
    public function getAll(Request $request, Response $response)
    {
        try {
            // Start with Eloquent query that eager loads diocese & parish
            $query = Crusade::with(['diocese', 'parish']);

            // Read potential filters from query params
            $params    = $request->getQueryParams();
            $state     = $params['state']       ?? null;
            $dioceseID = $params['diocese_id']  ?? null;
            $parishID  = $params['parish_id']   ?? null;

            // Apply filters only if non-null and not the literal 'null' string
            if ($state && $state !== 'null') {
                $query->where('State', $state);
            }
            if ($dioceseID && $dioceseID !== 'null') {
                $query->where('DioceseID', $dioceseID);
            }
            if ($parishID && $parishID !== 'null') {
                $query->where('ParishID', $parishID);
            }

            $crusades = $query->get();
            $response->getBody()->write(json_encode($crusades));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching crusades", $e);
        }
    }


    /**
     * GET /crusades/{id} - Get a single crusade by ID (with related diocese and parish)
     */
    public function getById(Request $request, Response $response, $args)
    {
        try {
            $crusade = Crusade::with(['diocese', 'parish'])->find($args['id']);
            if (!$crusade) {
                return $this->notFoundResponse($response, "Crusade not found");
            }
            $response->getBody()->write(json_encode($crusade));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error fetching crusade", $e);
        }
    }

    /**
     * POST /crusades - Create a new crusade (Protected by AuthMiddleware)
     */
    public function create(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody(), true);
            $crusade = Crusade::create($data);
            $response->getBody()->write(json_encode($crusade));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error creating crusade", $e);
        }
    }

    /**
     * PUT /crusades/{id} - Update a crusade (Protected by AuthMiddleware)
     */
    public function update(Request $request, Response $response, $args)
    {
        try {
            $crusade = Crusade::find($args['id']);
            if (!$crusade) {
                return $this->notFoundResponse($response, "Crusade not found");
            }
            $data = json_decode($request->getBody(), true);
            $crusade->update($data);
            $response->getBody()->write(json_encode($crusade));
            return $response->withHeader('Content-Type', 'application/json');
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error updating crusade", $e);
        }
    }

    /**
     * DELETE /crusades/{id} - Delete a crusade (Protected by AuthMiddleware)
     */
    public function delete(Request $request, Response $response, $args)
    {
        try {
            $crusade = Crusade::find($args['id']);
            if (!$crusade) {
                return $this->notFoundResponse($response, "Crusade not found");
            }
            $crusade->delete();
            return $response->withStatus(204); // No content response
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error deleting crusade", $e);
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
