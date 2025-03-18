<?php

namespace App\Controllers;

use App\Models\User;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;
use Slim\Psr7\Response as SlimResponse;

class UserController
{
    /**
     * GET /users
     * Return all users
     */
    public function getAll(Request $request, Response $response): Response
    {
        $users = User::all();
        return $this->jsonResponse($response, 200, true, "All users retrieved successfully", $users);
    }

    /**
     * GET /users/{id}
     * Return a single user by ID
     */
    public function getById(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];
        $user = User::find($id);

        if (!$user) {
            return $this->jsonResponse($response, 404, false, "User not found");
        }

        return $this->jsonResponse($response, 200, true, "User retrieved successfully", $user);
    }

    /**
     * POST /users
     * Create a new user
     */
    public function create(Request $request, Response $response): Response
    {
        $data = $request->getParsedBody();

        try {
            $user = new User();
            $user->fill($data); // This triggers the password mutator if 'UserPassword' is set
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
        $data = $request->getParsedBody();

        $user = User::find($id);
        if (!$user) {
            return $this->jsonResponse($response, 404, false, "User not found");
        }

        try {
            $user->fill($data); // Will also hash password if 'UserPassword' is provided
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
        $user = User::find($id);

        if (!$user) {
            return $this->jsonResponse($response, 404, false, "User not found");
        }

        try {
            $user->delete();
            return $this->jsonResponse($response, 200, true, "User deleted successfully");
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Failed to delete user", [
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * Helper method to return JSON responses
     */
    private function jsonResponse(Response $response, int $status, bool $success, string $message, $data = null): Response
    {
        $payload = [
            "success" => $success,
            "status"  => $status,
            "message" => $message,
            "data"    => $data
        ];

        $response->getBody()->write(json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));
        return $response->withHeader('Content-Type', 'application/json')->withStatus($status);
    }
}
