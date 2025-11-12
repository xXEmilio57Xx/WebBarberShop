<?php
include 'conexion.php';

$id_barbero = $_GET['id_barbero'];
$fecha = $_GET['fecha'];

$sql = "SELECT hora_cita FROM citas WHERE id_barbero = ? AND fecha_cita = ?";
$stmt = $conexion->prepare($sql);
$stmt->bind_param("is", $id_barbero, $fecha);
$stmt->execute();
$result = $stmt->get_result();

$horasOcupadas = [];
while($row = $result->fetch_assoc()) {
    $horasOcupadas[] = $row['hora_cita'];
}

header('Content-Type: application/json');
echo json_encode($horasOcupadas);
?>
