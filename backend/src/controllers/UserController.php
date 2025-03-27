<?php

namespace App\Controllers;

use App\Controllers\Traits\JsonResponseTrait;
use App\Models\User;
use Psr\Http\Message\ResponseInterface as Response;
use Psr\Http\Message\ServerRequestInterface as Request;

class UserController
{
    use JsonResponseTrait;

    /**
     * GET /users
     */
    public function getAll(Request $request, Response $response): Response
    {
        try {
            $users = User::all();
            // Password-hiding logic is in the trait's jsonResponse
            return $this->jsonResponse($response, 200, true, "All users retrieved successfully", $users);
        } catch (\Exception $e) {
            return $this->jsonResponse($response, 500, false, "Failed to fetch users", [
                "error" => $e->getMessage()
            ]);
        }
    }

    /**
     * GET /users/{id}
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
     */
    public function create(Request $request, Response $response): Response
    {
        try {
            $data = json_decode($request->getBody(), true);

            // Basic validation
            if (empty($data['UserEmail']) || empty($data['UserPassword'])) {
                return $this->jsonResponse($response, 400, false, "Missing email or password");
            }

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
     */
    public function update(Request $request, Response $response, array $args): Response
    {
        $id = (int) $args['id'];

        try {
            $user = User::find($id);
            if (!$user) {
                return $this->jsonResponse($response, 404, false, "User not found");
            }

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
}
