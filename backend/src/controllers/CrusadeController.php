<?php

namespace App\Controllers;

use App\Controllers\Traits\JsonResponseTrait;
use App\Models\Crusade;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class CrusadeController
{
    use JsonResponseTrait;

    /**
     * GET /crusades
     * Optionally filtered by state_id, diocese_id, parish_id
     */
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $query = Crusade::with(['diocese', 'parish', 'state']);

            $params = $request->getQueryParams();
            $filters = [
                'StateID'   => $params['state_id']     ?? null,
                'DioceseID' => $params['diocese_id']   ?? null,
                'ParishID'  => $params['parish_id']    ?? null,
            ];

            foreach ($filters as $column => $value) {
                if ($value && $value !== 'null') {
                    $query->where($column, $value);
                }
            }

            $crusades = $query->get();
            return $this->jsonResponse($response, 200, true, "All crusades fetched", $crusades);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching crusades", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /crusades/{id}
     */
    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $crusade = Crusade::with(['diocese', 'parish', 'state'])->find($args['id']);
            if (!$crusade) {
                return $this->jsonResponse($response, 404, false, "Crusade not found");
            }
            return $this->jsonResponse($response, 200, true, "Crusade fetched successfully", $crusade);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching crusade", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /crusades
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            // Minimal validation
            $requiredFields = ['StateID', 'DioceseID', 'ParishID'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->jsonResponse($response, 400, false, "Missing field: {$field}");
                }
            }

            $crusade = Crusade::create($data);
            return $this->jsonResponse($response, 201, true, "Crusade created successfully", $crusade);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error creating crusade", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * PUT /crusades/{id}
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $crusade = Crusade::find($args['id']);
            if (!$crusade) {
                return $this->jsonResponse($response, 404, false, "Crusade not found");
            }

            $data = json_decode($request->getBody(), true);
            $crusade->update($data);

            return $this->jsonResponse($response, 200, true, "Crusade updated successfully", $crusade);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error updating crusade", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE /crusades/{id}
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $crusade = Crusade::find($args['id']);
            if (!$crusade) {
                return $this->jsonResponse($response, 404, false, "Crusade not found");
            }

            $crusade->delete();
            return $this->jsonResponse($response, 204, true, "Crusade deleted successfully");
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error deleting crusade", [
                "details" => $e->getMessage()
            ]);
        }
    }
}
