<?php
include 'conexion.php'; // tu archivo de conexión existente

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $nombre = trim($_POST['nombre']);
    $correo = trim($_POST['correo']);
    $password = trim($_POST['password']);

    // Validación básica
    if (empty($nombre) || empty($correo) || empty($password)) {
        echo "Por favor completa todos los campos.";
        exit();
    }

    // Hashear contraseña antes de guardar
    $password_hash = password_hash($password, PASSWORD_DEFAULT);

    // Insertar usuario en la base de datos
    $sql = "INSERT INTO usuarios (nombre, correo, password) VALUES (?, ?, ?)";
    $stmt = $conn->prepare($sql);
    $stmt->bind_param("sss", $nombre, $correo, $password_hash);

    if ($stmt->execute()) {
        echo "<script>
                alert('Usuario registrado correctamente. Ahora puedes iniciar sesión.');
                window.location.href = '../login.html';
              </script>";
    } else {
        echo "Error al registrar usuario: " . $conn->error;
    }

    $stmt->close();
    $conn->close();
}
?>
