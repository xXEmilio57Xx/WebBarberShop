<?php
header('Content-Type: application/json');
require __DIR__ . '/../vendor/autoload.php';

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCaptureRequest;

// Credenciales Sandbox
$clientId = "ARJKG7lXUiGLKfn_Jt6P8uhQV-FqDy44pQw8DHnVG5JqunKvmF2K116D2w6978lPoVVpfclqK94bDnyo";
$clientSecret = "ENalUtzSsrOql6XTPFl6z_MCMdds6tSgunbTPyg9WZ125p9pyDQJ_YNEL5ByYDcXD_8sMQKFLfCiZP9W";

$environment = new SandboxEnvironment($clientId, $clientSecret);
$client = new PayPalHttpClient($environment);

// Recibir orderID desde JavaScript
$input = json_decode(file_get_contents("php://input"), true);
$orderID = $input["orderID"] ?? null;

if (!$orderID) {
    echo json_encode(["error" => "No se recibió orderID"]);
    exit;
}

try {
    // Capturar el pago en PayPal
    $request = new OrdersCaptureRequest($orderID);
    $response = $client->execute($request);

    echo json_encode([
        "status" => $response->result->status,
        "id" => $response->result->id
    ]);

} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}
