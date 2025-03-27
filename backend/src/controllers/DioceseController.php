<?php

namespace App\Controllers;

use App\Controllers\Traits\JsonResponseTrait;
use App\Models\Diocese;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class DioceseController
{
    use JsonResponseTrait;

    /**
     * GET /dioceses - Get all dioceses (including related parishes)
     */
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $dioceses = Diocese::with('parishes')->get();
            return $this->jsonResponse($response, 200, true, "All dioceses fetched", $dioceses);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching dioceses", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /dioceses/{id}
     */
    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $diocese = Diocese::with('parishes')->find($args['id']);
            if (!$diocese) {
                return $this->jsonResponse($response, 404, false, "Diocese not found");
            }
            return $this->jsonResponse($response, 200, true, "Diocese fetched successfully", $diocese);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching diocese", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /dioceses
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            // Minimal validation
            if (empty($data['DioceseName']) || empty($data['StateID'])) {
                return $this->jsonResponse($response, 400, false, "Missing required fields: DioceseName or StateID");
            }

            $diocese = Diocese::create($data);
            return $this->jsonResponse($response, 201, true, "Diocese created successfully", $diocese);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error creating diocese", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * PUT /dioceses/{id}
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $diocese = Diocese::find($args['id']);
            if (!$diocese) {
                return $this->jsonResponse($response, 404, false, "Diocese not found");
            }

            $data = json_decode($request->getBody(), true);
            $diocese->update($data);

            return $this->jsonResponse($response, 200, true, "Diocese updated successfully", $diocese);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error updating diocese", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE /dioceses/{id}
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $diocese = Diocese::find($args['id']);
            if (!$diocese) {
                return $this->jsonResponse($response, 404, false, "Diocese not found");
            }
            $diocese->delete();

            return $this->jsonResponse($response, 204, true, "Diocese deleted successfully");
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error deleting diocese", [
                "details" => $e->getMessage()
            ]);
        }
    }
}
