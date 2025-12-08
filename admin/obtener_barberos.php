<?php
header("Content-Type: application/json");
include "../php/conexion.php";

$consulta = "SELECT id_barbero, nombre FROM barberos";
$resultado = $conn->query($consulta);

$barberos = [];

if ($resultado && $resultado->num_rows > 0) {
    while ($fila = $resultado->fetch_assoc()) {
        $barberos[] = $fila;
    }
}

echo json_encode($barberos);
?>
