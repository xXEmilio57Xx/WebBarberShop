<?php
include 'conexion.php';
session_start();

if (!isset($_SESSION['id_usuario'])) {
    echo "No hay sesión activa";
    exit;
}

$id_usuario = $_SESSION['id_usuario'];
$id_barbero = $_POST['id_barbero']; 
$fecha_cita = $_POST['fecha_cita'];
$hora_cita = $_POST['hora_cita'];
$servicio = $_POST['servicio'];
$estado = 'pendiente'; // por defecto



// ---- Restricciones ----

// No permitir domingos
$diaSemana = date('w', strtotime($fecha_cita)); // 0 = Domingo, 6 = Sábado
if ($diaSemana == 0) {
    die("No se pueden agendar citas los domingos.");
}

// Horario permitido: 09:00 a 18:00
if ($hora_cita < '09:00' || $hora_cita > '18:00') {
    die("El horario de atención es de 9:00 AM a 6:00 PM.");
}

// Ejemplo: no permitir citas antes del día actual
if ($fecha_cita < date('Y-m-d')) {
    die("No puedes agendar citas en fechas pasadas.");
}

// Verificar disponibilidad
$sql = "SELECT * FROM citas WHERE id_barbero = ? AND fecha_cita = ? AND hora_cita = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("iss", $id_barbero, $fecha_cita, $hora_cita);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    die("Esa hora ya está ocupada, selecciona otra.");
}


//SI SE CUMPLEN TODAS LAS RESTRICCIONES AHORA SI GUARDA LA CITA.    
$sql = "INSERT INTO citas (id_usuario, id_barbero, fecha_cita, hora_cita, servicio, estado)
        VALUES ('$id_usuario', '$id_barbero', '$fecha_cita', '$hora_cita', '$servicio', '$estado')";

if ($conn->query($sql) === TRUE) {
    echo "Cita registrada correctamente.";
} else {
    echo "Error: " . $conexion->error;
}

$conn->close();
?>
