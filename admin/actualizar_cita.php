<?php
include "../php/conexion.php";

$id_cita     = $_POST["id_cita"];
$id_barbero  = $_POST["id_barbero"];
$fecha       = $_POST["fecha_cita"];
$hora        = $_POST["hora_cita"];
$servicio    = $_POST["servicio"];
$estado      = $_POST["estado"];

$sql = "UPDATE citas SET
            id_barbero = '$id_barbero',
            fecha_cita = '$fecha',
            hora_cita = '$hora',
            servicio = '$servicio',
            estado = '$estado'
        WHERE id_cita = '$id_cita'";

if ($conn->query($sql) === TRUE) {
    echo "Cita actualizada correctamente.";
} else {
    echo "Error al actualizar cita: " . $conn->error;
}
?>
