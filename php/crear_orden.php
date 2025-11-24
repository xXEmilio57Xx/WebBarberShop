<?php
header('Content-Type: application/json');

require __DIR__ . '/../vendor/autoload.php';

use PayPalCheckoutSdk\Core\PayPalHttpClient;
use PayPalCheckoutSdk\Core\SandboxEnvironment;
use PayPalCheckoutSdk\Orders\OrdersCreateRequest;

// Configurar credenciales sandbox
$clientId = "ARJKG7lXUiGLKfn_Jt6P8uhQV-FqDy44pQw8DHnVG5JqunKvmF2K116D2w6978lPoVVpfclqK94bDnyo";
$clientSecret = "ENalUtzSsrOql6XTPFl6z_MCMdds6tSgunbTPyg9WZ125p9pyDQJ_YNEL5ByYDcXD_8sMQKFLfCiZP9W";

$environment = new SandboxEnvironment($clientId, $clientSecret);
$client = new PayPalHttpClient($environment);

// Leer carrito del frontend
$input = json_decode(file_get_contents('php://input'), true);
$cart = $input['cart'] ?? [];

if (empty($cart)) {
    echo json_encode(['error' => 'Carrito vacío']);
    exit;
}

// Crear items para PayPal
$items = [];
$total = 0;
foreach ($cart as $p) {
    $items[] = [
        'name' => $p['nombre'],
        'unit_amount' => [
            'currency_code' => 'MXN',
            'value' => number_format($p['precio'], 2, '.', '')
        ],
        'quantity' => strval($p['cantidad'])
    ];
    $total += $p['precio'] * $p['cantidad'];
}

$request = new OrdersCreateRequest();
$request->prefer('return=representation');
$request->body = [
    'intent' => 'CAPTURE',
    'purchase_units' => [[
        'amount' => [
            'currency_code' => 'MXN',
            'value' => number_format($total, 2, '.', ''),
            'breakdown' => [
                'item_total' => [
                    'currency_code' => 'MXN',
                    'value' => number_format($total, 2, '.', '')
                ]
            ]
        ],
        'items' => $items
    ]]
];

try {
    $response = $client->execute($request);
    echo json_encode(['id' => $response->result->id]);
} catch (Exception $e) {
    echo json_encode(['error' => $e->getMessage()]);
}

