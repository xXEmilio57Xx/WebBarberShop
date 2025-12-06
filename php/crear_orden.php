<?php
header('Content-Type: application/json');
require __DIR__ . '/../vendor/autoload.php';

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;

// Credenciales Sandbox
$clientId = "ARJKG7lXUiGLKfn_Jt6P8uhQV-FqDy44pQw8DHnVG5JqunKvmF2K116D2w6978lPoVVpfclqK94bDnyo";
$clientSecret = "ENalUtzSsrOql6XTPFl6z_MCMdds6tSgunbTPyg9WZ125p9pyDQJ_YNEL5ByYDcXD_8sMQKFLfCiZP9W";

$environment = new SandboxEnvironment($clientId, $clientSecret);
$client = new PayPalHttpClient($environment);

// Recibir datos del frontend
$input = json_decode(file_get_contents("php://input"), true);

$cart = $input["cart"] ?? [];
$descuento = floatval($input["descuento"] ?? 0);
$totalFinal = floatval($input["totalFinal"] ?? 0); // ← VIENE DEL FRONTEND

if (empty($cart)) {
    echo json_encode(["error" => "Carrito vacío"]);
    exit;
}

// Si el frontend no envió totalFinal, generarlo aquí como respaldo
$total = 0;
$items = [];

foreach ($cart as $p) {
    $precio = floatval($p["precio"]);
    $cantidad = intval($p["cantidad"]);

    $items[] = [
        "name" => $p["nombre"],
        "unit_amount" => [
            "currency_code" => "MXN",
            "value" => number_format($precio, 2, ".", "")
        ],
        "quantity" => strval($cantidad)
    ];

    $total += ($precio * $cantidad);
}

// Si por alguna razón no vino totalFinal, lo calculamos
if ($totalFinal <= 0) {
    $totalFinal = $total - $descuento;
}

if ($totalFinal < 0) {
    $totalFinal = 0;
}

$request = new OrdersCreateRequest();
$request->prefer("return=representation");
$request->body = [
    "intent" => "CAPTURE",
    "purchase_units" => [[
        "amount" => [
            "currency_code" => "MXN",
            "value" => number_format($totalFinal, 2, ".", ""), // ← TOTAL FINAL CON DESCUENTO
            "breakdown" => [
                "item_total" => [
                    "currency_code" => "MXN",
                    "value" => number_format($total, 2, ".", "")
                ],
                // Aplicar descuento a PayPal
                "discount" => [
                    "currency_code" => "MXN",
                    "value" => number_format($descuento, 2, ".", "")
                ]
            ]
        ],
        "items" => $items
    ]]
];

try {
    $response = $client->execute($request);
    echo json_encode(["id" => $response->result->id]);
} catch (Exception $e) {
    echo json_encode(["error" => $e->getMessage()]);
}

