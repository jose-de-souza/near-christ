<?php

namespace App\Controllers;

use App\Controllers\Traits\JsonResponseTrait;
use App\Models\State;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class StateController
{
    use JsonResponseTrait;

    /**
     * GET /states
     */
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $states = State::all();
            return $this->jsonResponse($response, 200, true, "All states fetched", $states);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching states", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /states/{id}
     */
    public function getById(Request $request, Response $response, array $args): Response
    {
        try {
            $state = State::find($args['id']);
            if (!$state) {
                return $this->jsonResponse($response, 404, false, "State not found");
            }
            return $this->jsonResponse($response, 200, true, "State fetched successfully", $state);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error fetching state", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /states
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            if (empty($data['StateName'])) {
                return $this->jsonResponse($response, 400, false, "Missing required field: StateName");
            }

            $state = State::create($data);
            return $this->jsonResponse($response, 201, true, "State created successfully", $state);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error creating state", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * PUT /states/{id}
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        try {
            $state = State::find($args['id']);
            if (!$state) {
                return $this->jsonResponse($response, 404, false, "State not found");
            }

            $data = json_decode($request->getBody(), true);
            $state->update($data);

            return $this->jsonResponse($response, 200, true, "State updated successfully", $state);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error updating state", [
                "details" => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE /states/{id}
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        try {
            $state = State::find($args['id']);
            if (!$state) {
                return $this->jsonResponse($response, 404, false, "State not found");
            }
            $state->delete();

            return $this->jsonResponse($response, 204, true, "State deleted successfully");
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Error deleting state", [
                "details" => $e->getMessage()
            ]);
        }
    }
}
