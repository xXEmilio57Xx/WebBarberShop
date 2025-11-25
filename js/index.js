document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btnLogin");
    const saludo = document.getElementById("saludo");
    const btnLogout = document.getElementById("btnLogout");

    // Si no existen los elementos, salimos para evitar errores
    if (!btnLogin || !saludo || !btnLogout) return;

    const usuario = localStorage.getItem("usuario");

    if (usuario) {
        // Ocultar botón de login
        btnLogin.style.display = "none";

        // Mostrar botón de cerrar sesión
        btnLogout.style.display = "inline-block";

        // Mostrar saludo según la hora
        const hora = new Date().getHours();
        let mensaje = "";

        if (hora >= 5 && hora < 12) mensaje = "¡Buenos días";
        else if (hora >= 12 && hora < 19) mensaje = "¡Buenas tardes";
        else mensaje = "¡Buenas noches";

        saludo.style.display = "inline-block";
        saludo.textContent = `${mensaje}, ${usuario}!`;
    } else {
        // Aseguramos estado inicial
        btnLogin.style.display = "inline-block";
        saludo.style.display = "none";
        btnLogout.style.display = "none";
    }

    // Acción de logout -> redirige al php logout que destruye session y limpia localStorage
    btnLogout.addEventListener("click", () => {
        window.location.href = "php/logout.php";
    });
});
