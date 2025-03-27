<?php

namespace App\Controllers;

use App\Controllers\Traits\JsonResponseTrait;
use App\Models\Adoration;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class AdorationController
{
    use JsonResponseTrait;

    /**
     * GET /adorations
     */
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $query = Adoration::with(['diocese', 'parish', 'state']);

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

            $adorations = $query->get();
            return $this->jsonResponse($response, 200, true, "All adorations fetched", $adorations);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching adorations", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /adorations/{id}
     */
    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $adoration = Adoration::with(['diocese', 'parish', 'state'])->find($args['id']);
            if (!$adoration) {
                return $this->jsonResponse($response, 404, false, "Adoration not found");
            }
            return $this->jsonResponse($response, 200, true, "Adoration fetched successfully", $adoration);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching adoration", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /adorations
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            // Minimal validation
            $requiredFields = ['StateID', 'DioceseID', 'ParishID', 'AdorationType'];
            foreach ($requiredFields as $field) {
                if (empty($data[$field])) {
                    return $this->jsonResponse($response, 400, false, "Missing field: {$field}");
                }
            }

            $adoration = Adoration::create($data);
            return $this->jsonResponse($response, 201, true, "Adoration created successfully", $adoration);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error creating adoration", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * PUT /adorations/{id}
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $adoration = Adoration::find($args['id']);
            if (!$adoration) {
                return $this->jsonResponse($response, 404, false, "Adoration not found");
            }

            $data = json_decode($request->getBody(), true);
            $adoration->update($data);

            return $this->jsonResponse($response, 200, true, "Adoration updated successfully", $adoration);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error updating adoration", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE /adorations/{id}
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $adoration = Adoration::find($args['id']);
            if (!$adoration) {
                return $this->jsonResponse($response, 404, false, "Adoration not found");
            }

            $adoration->delete();
            // 204 = no content, but we'll return a JSON body anyway for consistency
            return $this->jsonResponse($response, 204, true, "Adoration deleted successfully");
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error deleting adoration", [
                "details" => $e->getMessage()
            ]);
        }
    }
}
