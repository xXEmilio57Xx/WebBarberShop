<?php
session_start();
include 'conexion.php';

// Sólo aceptar POST
if ($_SERVER["REQUEST_METHOD"] !== "POST") {
    http_response_code(405);
    echo "Método no permitido";
    exit;
}

$correo = $conn->real_escape_string($_POST["correo"] ?? "");
$password = $_POST["password"] ?? "";

$sql = "SELECT id_usuario, nombre, correo, password, rol FROM usuarios WHERE correo = '$correo' LIMIT 1";
$resultado = $conn->query($sql);

if (!$resultado) {
    // Error de consulta
    $error = "Error en la consulta: " . $conn->error;
    // Mostrar algo simple
    echo "<p>$error</p>";
    exit;
}

if ($resultado->num_rows === 0) {
    // Usuario no encontrado - mostrar mensaje y enlace
    echo "<!doctype html><meta charset='utf-8'><p>Correo no encontrado. <a href='../login.html'>Volver</a></p>";
    exit;
}

$usuario = $resultado->fetch_assoc();

// Verificar contraseña
if (!password_verify($password, $usuario['password'])) {
    echo "<!doctype html><meta charset='utf-8'><p>Contraseña incorrecta. <a href='../login.html'>Volver</a></p>";
    exit;
}

// LOGIN CORRECTO: establecer SESSION
$_SESSION["id_usuario"] = $usuario["id_usuario"];
$_SESSION["nombre"] = $usuario["nombre"];
$_SESSION["rol"] = $usuario["rol"];

// Aquí devolvemos HTML pequeño que guarda en localStorage y redirige.
// Usamos json_encode para escapar correctamente el nombre.
$nombreJS = json_encode($usuario["nombre"]);

// Si quieres redirigir a admin según rol:
$destino = ($usuario["rol"] === "admin") ? "../admin/admin_citas.html" : "../index.html";

echo "<!doctype html>
<html>
<head><meta charset='utf-8'><title>Redirigiendo...</title></head>
<body>
<script>
  try {
    // Guardar nombre en localStorage (clave 'usuario')
    localStorage.setItem('usuario', $nombreJS);
  } catch (e) {
    console.error('No se pudo guardar en localStorage', e);
  }
  // Redirigir
  window.location.href = '$destino';
</script>
<p>Redirigiendo...</p>
</body>
</html>";

$conn->close();
exit;

