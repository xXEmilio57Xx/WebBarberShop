<?php
session_start();
include("conexion.php");

if (!isset($_GET['id_producto'])) {
    echo json_encode([]);
    exit;
}

$id_producto = intval($_GET['id_producto']);

$sql = "SELECT r.RES_ID, r.PRO_ID, r.USU_ID, r.CALIFICACION, r.COMENTARIO, r.FECHA, u.NOMBRE
        FROM reseña r
        JOIN usuarios u ON r.USU_ID = u.id_usuario
        WHERE r.PRO_ID = ? 
        ORDER BY r.FECHA DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param("i", $id_producto);
$stmt->execute();
$result = $stmt->get_result();

$reseñas = [];
while ($row = $result->fetch_assoc()) {
    $reseñas[] = [
        "id" => $row["RES_ID"],
        "usuario" => $row["NOMBRE"],
        "calificacion" => intval($row["CALIFICACION"]),
        "comentario" => $row["COMENTARIO"],
        "fecha" => $row["FECHA"]
    ];
}

header("Content-Type: application/json");
echo json_encode($reseñas);
?>
