<?php
include("conexion.php");

$sql = "SELECT * FROM producto";
$result = $conn->query($sql);

$productos = [];

while ($row = $result->fetch_assoc()) {
    $productos[] = [
        "id" => $row["PRO_ID"],
        "nombre" => $row["PRO_NOMBRE"],
        "descripcion" => $row["PRO_DESCRIPCION"],
        "precio" => $row["PRO_PRECIO"],
        "imagen" => $row["PRO_IMAGEN"]
    ];
}

header("Content-Type: application/json");
echo json_encode($productos);
?>
