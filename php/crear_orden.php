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
$iva = floatval($input["iva"] ?? 0);
$totalFinal = floatval($input["totalFinal"] ?? 0); 

if (empty($cart)) {
    echo json_encode(["error" => "Carrito vacío"]);
    exit;
}

// Calcular subtotal SIN DESCUENTO
$subtotal = 0;
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

    $subtotal += ($precio * $cantidad);
}

// Validación: si el frontend no envió totalFinal, calcularlo
if ($totalFinal <= 0) {
    $subtotalConDescuento = $subtotal - $descuento;
    $totalFinal = $subtotalConDescuento + $iva;
}

// PayPal NO acepta negativos
if ($totalFinal < 0) $totalFinal = 0;

// Construir orden
$request = new OrdersCreateRequest();
$request->prefer("return=representation");
$request->body = [
    "intent" => "CAPTURE",
    "purchase_units" => [[
        "amount" => [
            "currency_code" => "MXN",
            "value" => number_format($totalFinal, 2, ".", ""),
            "breakdown" => [
                "item_total" => [
                    "currency_code" => "MXN",
                    "value" => number_format($subtotal, 2, ".", "")
                ],
                "discount" => [
                    "currency_code" => "MXN",
                    "value" => number_format($descuento, 2, ".", "")
                ],
                "tax_total" => [
                    "currency_code" => "MXN",
                    "value" => number_format($iva, 2, ".", "")
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


