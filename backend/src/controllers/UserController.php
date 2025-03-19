<?php

namespace App\Controllers;

use App\Models\User;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserController
{
    /**
     * GET /users
     * Return all users
     */
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $users = User::all();
            return $this->jsonResponse($response, 200, true, "All users retrieved successfully", $users);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Failed to fetch users", [
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /users/{id}
     * Return a single user by ID
     */
    public function getById(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        try {
            $user = User::find($id);
            if (!$user) {
                return $this->jsonResponse($response, 404, false, "User not found");
            }
            return $this->jsonResponse($response, 200, true, "User retrieved successfully", $user);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Failed to fetch user", [
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * POST /users
     * Create a new user
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            // Manually decode JSON from the request body
            $data = json_decode($request->getBody(), true);
            $user = new User();
            $user->fill($data);
            $user->save();
            return $this->jsonResponse($response, 201, true, "User created successfully", $user);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Failed to create user", [
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * PUT /users/{id}
     * Update an existing user by ID
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        try {
            $user = User::find($id);
            if (!$user) {
                return $this->jsonResponse($response, 404, false, "User not found");
            }
            // Decode JSON instead of using getParsedBody
            $data = json_decode($request->getBody(), true);
            $user->fill($data);
            $user->save();
            return $this->jsonResponse($response, 200, true, "User updated successfully", $user);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Failed to update user", [
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * DELETE /users/{id}
     * Delete a user by ID
     */
    public function delete(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        try {
            $user = User::find($id);
            if (!$user) {
                return $this->jsonResponse($response, 404, false, "User not found");
            }
            $user->delete();
            return $this->jsonResponse($response, 200, true, "User deleted successfully");
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Failed to delete user", [
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * Helper method to return wrapped JSON responses:
     * {
     *   "success": true/false,
     *   "status": 200/404/500, etc.,
     *   "message": "some text",
     *   "data": (could be an array, a single record, or null)
     * }
     */
    private function jsonResponse(Response $response, int $status, bool $success, string $message, $data = null): Response
    {
        // Remove the UserPassword attribute before sending data back to the client
        if ($data instanceof \Illuminate\Database\Eloquent\Model) {
            unset($data->UserPassword);
        } elseif ($data instanceof \Illuminate\Support\Collection) {
            $data = $data->map(function ($item) {
                unset($item->UserPassword);
                return $item;
            });
        }

        $payload = [
            "success" => $success,
            "status"  => $status,
            "message" => $message,
            "data"    => $data
        ];

        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')
                        ->withStatus($status);
    }
}
