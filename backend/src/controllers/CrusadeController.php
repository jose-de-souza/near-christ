<?php

namespace App\Controllers;

use App\Models\Crusade;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CrusadeController
{
    /**
     * GET /crusades
     * Optionally filtered by state_id, diocese_id, parish_id
     */
    public function getAll(Request $request, Response $response)
    {
        try {
            // Eager load diocese, parish, state
            $query = Crusade::with(['diocese', 'parish', 'state']);

            $params    = $request->getQueryParams();
            $stateID   = $params['state_id']     ?? null;
            $dioceseID = $params['diocese_id']   ?? null;
            $parishID  = $params['parish_id']    ?? null;

            if ($stateID && $stateID !== 'null') {
                $query->where('StateID', $stateID);
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
     * GET /crusades/{id}
     */
    public function getById(Request $request, Response $response, $args)
    {
        try {
            $crusade = Crusade::with(['diocese', 'parish', 'state'])->find($args['id']);
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
     * POST /crusades
     */
    public function create(Request $request, Response $response)
    {
        try {
            $data = json_decode($request->getBody(), true);
            // Expect "StateID", "DioceseID", "ParishID", etc.
            $crusade = Crusade::create($data);
            $response->getBody()->write(json_encode($crusade));
            return $response->withHeader('Content-Type', 'application/json')->withStatus(201);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error creating crusade", $e);
        }
    }

    /**
     * PUT /crusades/{id}
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
     * DELETE /crusades/{id}
     */
    public function delete(Request $request, Response $response, $args)
    {
        try {
            $crusade = Crusade::find($args['id']);
            if (!$crusade) {
                return $this->notFoundResponse($response, "Crusade not found");
            }
            $crusade->delete();
            return $response->withStatus(204);
        } catch (\Exception $e) {
            return $this->errorResponse($response, "Error deleting crusade", $e);
        }
    }

    private function errorResponse(Response $response, string $message, \Exception $e)
    {
        $response->getBody()->write(json_encode(["error" => $message, "details" => $e->getMessage()]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(500);
    }

    private function notFoundResponse(Response $response, string $message)
    {
        $response->getBody()->write(json_encode(["error" => $message]));
        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus(404);
    }
}
