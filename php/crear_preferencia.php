<?php
header('Content-Type: application/json; charset=utf-8');
header("Cache-Control: no-store, no-cache, must-revalidate, max-age=0");
header("Cache-Control: post-check=0, pre-check=0", false);
header("Pragma: no-cache");

require __DIR__ . '/../vendor/autoload.php';
use MercadoPago\Client\Preference\PreferenceClient;
use MercadoPago\MercadoPagoConfig;

// Token de prueba sandbox
MercadoPagoConfig::setAccessToken("APP_USR-908194582264741-111313-4a8dbc374ce844c533157115e9503a03-2988147159"); // <- tu token sandbox

// Leer carrito enviado desde JS
$input = file_get_contents("php://input");
$data = json_decode($input, true);
$cart = $data['cart'] ?? [];

// Validar y convertir carrito a items de Mercado Pago
$items = [];
foreach($cart as $p){
    $title = preg_replace('/[\'"]/', '', $p['nombre'] ?? 'Producto');
    $quantity = max(1, intval($p['cantidad'] ?? 1));
    $unit_price = floatval($p['precio'] ?? 0);
    if($unit_price <= 0) continue;

    $items[] = [
        "title" => substr($title,0,120),
        "quantity" => $quantity,
        "unit_price" => $unit_price,
        "currency_id" => "MXN"
    ];
}

if(empty($items)){
    echo json_encode(["error" => "Carrito vacío o productos inválidos"]);
    exit;
}

// Crear preferencia
$client = new PreferenceClient();
try {
    $preference = $client->create([
        "items" => $items,
        "back_urls" => [
            "success" => "http://localhost/SergioBarberShop/pago_exitoso.php",
            "failure" => "http://localhost/SergioBarberShop/pago_error.php",
            "pending" => "http://localhost/SergioBarberShop/pago_pendiente.php"
        ],
        "auto_return" => "approved"
    ]);

    echo json_encode([
        "success" => true,
        "preference_id" => $preference->id,
        "init_point" => $preference->init_point
    ]);

} catch (Exception $e) {
    echo json_encode([
        "error" => "Error al crear preferencia",
        "message" => $e->getMessage(),
        "trace" => $e->getTraceAsString()
    ]);
}


