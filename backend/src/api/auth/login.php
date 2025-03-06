<?php 
//ini_set('display_errors', 1);
//ini_set('display_startup_errors', 1);
//error_reporting(E_ALL);

/**
 * CORS headers
 */
header("Access-Control-Allow-Origin: *");// Allow all origins (Change to a specific origin for security in production)
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");// Allow specific HTTP methods
header("Access-Control-Allow-Headers: Content-Type, Authorization"); // Allow specific headers
header("Content-Type: application/json"); // Ensure JSON response

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

require __DIR__ . '/vendor/autoload.php'; // Composer autoload

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

header('Content-Type: application/json');

// Hard-coded credentials (ONLY for testing)
$validEmail = 'johnwayne@company.com';
$validPassword = '1234';

/** 
 * Read JSON input
 */
$input = json_decode(file_get_contents('php://input'), true);
if (!isset($input['email'], $input['password'])) {
    http_response_code(400);
    echo json_encode(["error" => "Missing email or password"]);
    exit();
}

/** 
 * Validate credentials
 */
if ($input['email'] !== $validEmail || $input['password'] !== $validPassword) {
    http_response_code(401);
    echo json_encode(["error" => "Invalid credentials"]);
    exit();
}

/** 
 * Generate JWT token
 */
// Ensure JWT Secret Key is available
$HOME = getenv('HOME');
$JWT_SECRET_KEY = file_get_contents($HOME.".JWT_SECRET_KEY");
putenv("JWT_SECRET_KEY=$JWT_SECRET_KEY");
$secretKey = getenv('JWT_SECRET_KEY');
if (!$secretKey) {
    http_response_code(500);
    echo json_encode(["error" => "JWT_SECRET_KEY is missing"]);
    exit();
}
$issuedAt = time();
$expirationTime = $issuedAt + 3600; // 1 hour validity
$payload = [
    'iss' => 'greatapps4you.us',
    'iat' => $issuedAt,
    'exp' => $expirationTime,
    'sub' => $validEmail, // or user ID from DB
    'user_id' => 7,       // example ID for John Wayne
    'role' => 'user'      // optional user role
];

/** 
 * Encode JWT token
 */
try {
    $accessToken = JWT::encode($payload, $secretKey, 'HS256');
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(["error" => "JWT encoding failed", "details" => $e->getMessage()]);
    exit();
}

/**
 * Return JSON response
 */
http_response_code(200);
echo json_encode([
    "accessToken" => $accessToken,
    "user" => [
        "id" => 7,
        "name" => "John Wayne",
        "email" => $validEmail
    ]
]);
exit();