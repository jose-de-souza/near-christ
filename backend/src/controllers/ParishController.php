<?php

namespace App\Controllers;

use App\Controllers\Traits\JsonResponseTrait;
use App\Models\Parish;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class ParishController
{
    use JsonResponseTrait;

    /**
     * GET /parishes
     */
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $parishes = Parish::with('diocese')->get();
            return $this->jsonResponse($response, 200, true, "All parishes fetched", $parishes);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching parishes", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /parishes/{id}
     */
    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $parish = Parish::with('diocese')->find($args['id']);
            if (!$parish) {
                return $this->jsonResponse($response, 404, false, "Parish not found");
            }
            return $this->jsonResponse($response, 200, true, "Parish fetched successfully", $parish);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching parish", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /parishes
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            // Minimal validation
            if (empty($data['DioceseID']) || empty($data['ParishName']) || empty($data['StateID'])) {
                return $this->jsonResponse($response, 400, false, "Missing one or more required fields: DioceseID, ParishName, StateID");
            }

            $parish = Parish::create($data);
            return $this->jsonResponse($response, 201, true, "Parish created successfully", $parish);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error creating parish", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * PUT /parishes/{id}
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $parish = Parish::find($args['id']);
            if (!$parish) {
                return $this->jsonResponse($response, 404, false, "Parish not found");
            }

            $data = json_decode($request->getBody(), true);
            $parish->update($data);

            return $this->jsonResponse($response, 200, true, "Parish updated successfully", $parish);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error updating parish", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE /parishes/{id}
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $parish = Parish::find($args['id']);
            if (!$parish) {
                return $this->jsonResponse($response, 404, false, "Parish not found");
            }

            $parish->delete();
            return $this->jsonResponse($response, 204, true, "Parish deleted successfully");
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error deleting parish", [
                "details" => $e->getMessage()
            ]);
        }
    }
}
