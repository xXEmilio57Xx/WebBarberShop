<?php
include "../php/conexion.php";

$sql = "SELECT 
    c.id_cita,
    u.nombre AS cliente,
    b.id_barbero,
    b.nombre AS barbero,
    c.fecha_cita,
    c.hora_cita,
    c.servicio,
    c.estado
FROM citas c
INNER JOIN usuarios u ON c.id_usuario = u.id_usuario
INNER JOIN barberos b ON c.id_barbero = b.id_barbero";


$resultado = $conn->query($sql);

$data = [];
while ($row = $resultado->fetch_assoc()) {
    $data[] = $row;
}

echo json_encode($data);
?>
