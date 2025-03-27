<?php

namespace App\Controllers;

use App\Models\Adoration;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdorationController
{
    /**
     * GET /adorations
     * Optional filters: ?state_id=1&diocese_id=2&parish_id=3
     */
    public function getAll(Request $request, Response $response)
    {
        try {
            // Eager-load diocese, parish, and state relationships
            $query = Adoration::with(['diocese', 'parish', 'state']);

            $params      = $request->getQueryParams();
            $stateID     = $params['state_id']     ?? null;
            $dioceseID   = $params['diocese_id']   ?? null;
            $parishID    = $params['parish_id']    ?? null;

            // Filter by StateID if provided
            if ($stateID && $stateID !== 'null') {
                $query->where('StateID', $stateID);
            }
            // Filter by DioceseID if provided
            if ($dioceseID && $dioceseID !== 'null') {
                $query->where('DioceseID', $dioceseID);
            }
            // Filter by ParishID if provided
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
     * GET /adorations/{id}
     * Return a single adoration with diocese, parish, and state
     */
    public function getById(Request $request, Response $response, $args)
    {
        try {
            $adoration = Adoration::with(['diocese', 'parish', 'state'])->find($args['id']);
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
     * POST /adorations
     * Create a new adoration
     */
    public function create(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody(), true);
            // Expect data to contain "StateID", "DioceseID", etc.
            $adoration = Adoration::create($data);
            $response->getBody()->write(json_encode($adoration));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error creating adoration", $e);
        }
    }

    /**
     * PUT /adorations/{id}
     * Update an adoration
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
     * DELETE /adorations/{id}
     * Delete an adoration
     */
    public function delete(Request $request, Response $response, $args)
    {
        try {
            $adoration = Adoration::find($args['id']);
            if (!$adoration) {
                return $this->notFoundResponse($response, "Adoration not found");
            }
            $adoration->delete();
            return $response->withStatus(204);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error deleting adoration", $e);
        }
    }

    // Helper for error responses
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

    // Helper for not found
    private function notFoundResponse(Response $response, string $message)
    {
        $response->getBody()->write(json_encode(["error" => $message]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(404);
    }
}
