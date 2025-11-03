/* ==========================================================
   Archivo: principal.js
   Propósito: Controlar funciones globales del sitio web
   Autor: AM SERVICES
   ========================================================== */

// --- ACTIVAR EL ENLACE ACTUAL EN EL MENÚ ---
document.addEventListener("DOMContentLoaded", () => {
    const navLinks = document.querySelectorAll(".navbar-nav .nav-link");
    const currentPage = window.location.pathname.split("/").pop();

    navLinks.forEach(link => {
        if (link.getAttribute("href") === currentPage) {
            link.classList.add("active");
        } else {
            link.classList.remove("active");
        }
    });
});

// --- FUTURAS FUNCIONES GLOBALES ---
// Aquí agregaremos:
//  - Inicialización del carrito
//  - Control de usuario (si lo implementamos)
//  - Animaciones globales o alertas personalizadas
