<?php
header("Content-Type: application/json");
$data = json_decode(file_get_contents("php://input"), true);

$cupon = $data["cupon"] ?? "";

include "conexion.php";

$stmt = $conn->prepare("SELECT descuento, fecha_expira FROM cupones WHERE codigo = ? AND activo = 1");
$stmt->bind_param("s", $cupon);
$stmt->execute();
$stmt->store_result();

if ($stmt->num_rows === 0) {
    echo json_encode(["valido" => false, "mensaje" => "Cupón inválido"]);
    exit;
}

$stmt->bind_result($descuento, $expiracion);
$stmt->fetch();

if (strtotime($expiracion) < time()) {
    echo json_encode(["valido" => false, "mensaje" => "El cupón ha expirado"]);
    exit;
}

echo json_encode([
    "valido" => true,
    "descuento" => intval($descuento)
]);
