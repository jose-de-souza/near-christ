<?php

namespace App\Controllers\Traits;

use Psr\Http\Message\ResponseInterface as Response;

trait JsonResponseTrait
{
    /**
     * A reusable method to send JSON responses with consistent structure:
     * {
     *   "success": boolean,
     *   "status":  number,
     *   "message": string,
     *   "data":    mixed
     * }
     *
     * Also removes "UserPassword" if $data is an Eloquent Model or collection.
     */
    protected function jsonResponse(
        Response $response,
        int $status,
        bool $success,
        string $message,
        $data = null
    ): Response {
        // If data is an Eloquent model or collection, remove "UserPassword" if present.
        if ($data instanceof \Illuminate\Database\Eloquent\Model) {
            unset($data->UserPassword);
        } elseif ($data instanceof \Illuminate\Support\Collection) {
            $data = $data->map(function ($item) {
                if (isset($item->UserPassword)) {
                    unset($item->UserPassword);
                }
                return $item;
            });
        }

        $payload = [
            "success" => $success,
            "status"  => $status,
            "message" => $message,
            "data"    => $data,
        ];

        $response->getBody()->write(
            json_encode($payload, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
        );

        return $response
            ->withHeader('Content-Type', 'application/json')
            ->withStatus($status);
    }
}
