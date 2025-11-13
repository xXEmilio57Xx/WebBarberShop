<?php
session_start();
include("conexion.php");

if (!isset($_SESSION['id_usuario'])) {
    echo json_encode(["error" => "No hay sesión activa"]);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $usuario_id = $_SESSION['id_usuario'];
    $producto_id = intval($_POST['producto_id']);
    $calificacion = intval($_POST['calificacion']);
    $comentario = trim($_POST['comentario']);

    if ($calificacion < 1 || $calificacion > 5 || empty($comentario)) {
        echo json_encode(["error" => "Datos inválidos"]);
        exit;
    }

    $sql = "INSERT INTO reseña (PRO_ID, USU_ID, CALIFICACION, COMENTARIO, FECHA)
            VALUES (?, ?, ?, ?, NOW())";

    $stmt = $conn->prepare($sql);
    $stmt->bind_param("iiis", $producto_id, $usuario_id, $calificacion, $comentario);

    if ($stmt->execute()) {
        echo json_encode(["success" => true]);
    } else {
        echo json_encode(["error" => "Error al guardar reseña"]);
    }
}
?>
