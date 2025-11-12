<?php
session_start();
include 'conexion.php';

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $correo = $_POST["correo"];
    $password = $_POST["password"];

    $sql = "SELECT * FROM usuarios WHERE correo='$correo'";
    $resultado = $conn->query($sql);

    if ($resultado->num_rows > 0) {
        $usuario = $resultado->fetch_assoc();

        if (password_verify($password, $usuario["password"])) {
            $_SESSION["id_usuario"] = $usuario["id_usuario"];
            $_SESSION["nombre"] = $usuario["nombre"];
            $_SESSION["rol"] = $usuario["rol"];

            if ($usuario["rol"] == "admin") {
                header("Location: ../admin.html");
            } else {
                header("Location: ../index.html");
            }
            exit();
        } else {
            echo "Contraseña incorrecta";
        }
    } else {
        echo "Correo no encontrado";
    }

    $conn->close();
}
?>

