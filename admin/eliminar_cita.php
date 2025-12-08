<?php
header("Content-Type: application/json");

include "../php/conexion.php";

if (!$conn) {
    echo json_encode(["status" => "error", "message" => "Error de conexión a la base de datos"]);
    exit;
}

if (!isset($_POST["id_cita"])) {
    echo json_encode(["status" => "error", "message" => "ID de cita no proporcionado"]);
    exit;
}

$id_cita = intval($_POST["id_cita"]);

$sql = "DELETE FROM citas WHERE id_cita = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_cita);

if ($stmt->execute()) {
    echo json_encode(["status" => "success", "message" => "Cita eliminada correctamente"]);
} else {
    echo json_encode(["status" => "error", "message" => "No se pudo eliminar la cita"]);
}

$stmt->close();
$conn->close();
?>
