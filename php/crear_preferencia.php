<?php
require __DIR__ . "/../vendor/autoload.php";

use MercadoPago\MercadoPagoConfig;
use MercadoPago\Client\Preference\PreferenceClient;

// Configurar headers para CORS y JSON
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Log para debugging
file_put_contents("debug_log.txt", "=== INICIO REQUEST ===\n", FILE_APPEND);
file_put_contents("debug_log.txt", "Method: " . $_SERVER['REQUEST_METHOD'] . "\n", FILE_APPEND);

// Obtener input
$input = file_get_contents("php://input");
file_put_contents("debug_log.txt", "Raw input: " . $input . "\n", FILE_APPEND);
file_put_contents("debug_log.txt", "Input length: " . strlen($input) . "\n", FILE_APPEND);

// Verificar si hay datos POST normales (por si acaso)
if (!empty($_POST)) {
    file_put_contents("debug_log.txt", "POST data: " . json_encode($_POST) . "\n", FILE_APPEND);
}

if (empty($input)) {
    file_put_contents("debug_log.txt", "ERROR: Input vacío\n", FILE_APPEND);
    echo json_encode([
        "error" => "Datos vacíos recibidos",
        "debug" => [
            "input_length" => strlen($input),
            "post_data" => $_POST,
            "request_method" => $_SERVER['REQUEST_METHOD']
        ]
    ]);
    exit;
}

// Intentar decodificar JSON
$data = json_decode($input, true);
$json_error = json_last_error();

file_put_contents("debug_log.txt", "JSON error: " . $json_error . " - " . json_last_error_msg() . "\n", FILE_APPEND);
file_put_contents("debug_log.txt", "Decoded data: " . json_encode($data) . "\n", FILE_APPEND);

if ($json_error !== JSON_ERROR_NONE) {
    echo json_encode([
        "error" => "JSON inválido",
        "json_error" => json_last_error_msg(),
        "raw_input" => $input
    ]);
    exit;
}

if (!$data || !isset($data["cart"])) {
    echo json_encode([
        "error" => "Estructura de datos inválida",
        "data_received" => $data,
        "required_field" => "cart"
    ]);
    exit;
}

$cart = $data["cart"];

if (!is_array($cart) || empty($cart)) {
    echo json_encode(["error" => "Carrito vacío o inválido"]);
    exit;
}

file_put_contents("debug_log.txt", "Carrito recibido: " . json_encode($cart) . "\n", FILE_APPEND);

try {
    // Configurar Mercado Pago - VERIFICA ESTE TOKEN
    MercadoPagoConfig::setAccessToken("APP_USR-908194582264741-111313-4a8dbc374ce844c533157115e9503a03-2988147159");
    
    $client = new PreferenceClient();
    
    // Preparar items
    $items = [];
    $total = 0;
    
    foreach ($cart as $index => $item) {
        $nombre = $item["nombre"] ?? $item["name"] ?? "Producto " . ($index + 1);
        $cantidad = intval($item["cantidad"] ?? $item["quantity"] ?? 1);
        $precio = floatval($item["precio"] ?? $item["price"] ?? 0);
        
        if ($cantidad > 0 && $precio > 0) {
            $items[] = [
                "id" => $item["id"] ?? "item_" . ($index + 1),
                "title" => $nombre,
                "quantity" => $cantidad,
                "unit_price" => $precio,
                "currency_id" => "MXN"
            ];
            $total += $cantidad * $precio;
        }
    }
    
    file_put_contents("debug_log.txt", "Items procesados: " . json_encode($items) . "\n", FILE_APPEND);
    
    if (empty($items)) {
        echo json_encode(["error" => "No hay items válidos en el carrito"]);
        exit;
    }
    
    // Crear preferencia
    $preferenceData = [
        "items" => $items,
        "back_urls" => [
            "success" => "http://localhost/SergioBarberShop/success.html",
            "failure" => "http://localhost/SergioBarberShop/failure.html",
            "pending" => "http://localhost/SergioBarberShop/pending.html"
        ],
        "auto_return" => "approved",
        "statement_descriptor" => "BARBERIA NEGRITO"
    ];
    
    file_put_contents("debug_log.txt", "Preference data: " . json_encode($preferenceData) . "\n", FILE_APPEND);
    
    $preference = $client->create($preferenceData);
    
    file_put_contents("debug_log.txt", "Preferencia creada: " . $preference->id . "\n", FILE_APPEND);
    
    echo json_encode([
        "success" => true,
        "id" => $preference->id,
        "total" => $total,
        "items_count" => count($items)
    ]);
    
} catch (Exception $e) {
    file_put_contents("debug_log.txt", "ERROR MercadoPago: " . $e->getMessage() . "\n", FILE_APPEND);
    
    echo json_encode([
        "error" => "Error creando preferencia de pago", 
        "message" => $e->getMessage(),
        "details" => "Verifica tu access token y configuración"
    ]);
}

file_put_contents("debug_log.txt", "=== FIN REQUEST ===\n\n", FILE_APPEND);
?>