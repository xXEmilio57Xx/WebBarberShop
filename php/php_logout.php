<?php
session_start();
session_unset();
session_destroy();

echo "<!doctype html>
<html><head><meta charset='utf-8'><title>Logout</title></head>
<body>
<script>
  try { localStorage.removeItem('usuario'); } catch(e) {}
  window.location.href = '../index.html';
</script>
<p>Saliendo...</p>
</body></html>";
exit;
