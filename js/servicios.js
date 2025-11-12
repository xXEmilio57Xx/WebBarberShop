document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("lista-servicios");

  fetch("data/servicios.json")
    .then(response => response.json())
    .then(servicios => {
      servicios.forEach(servicio => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("col-md-4", "mb-4");

        tarjeta.innerHTML = `
          <div class="card h-100 shadow-sm servicio-card">
            <img src="${servicio.imagen}" class="card-img-top" alt="${servicio.nombre}">
            <div class="card-body text-center">
              <h5 class="card-title fw-bold">${servicio.nombre}</h5>
              <p class="card-text text-muted">${servicio.descripcion}</p>
              <p class="fw-semibold">$${servicio.precio} MXN</p>
              <a href="citas.html" class="btn btn-primary btn-agendar" data-servicio="${servicio.nombre}">
                Agendar cita
              </a>
            </div>
          </div>
        `;
        contenedor.appendChild(tarjeta);
      });

      // Delegación: si los botones se crean dinámicamente, mejor delegar
      document.addEventListener("click", (e) => {
        const btn = e.target.closest(".btn-agendar");
        if (!btn) return;
        const nombreServicio = btn.getAttribute("data-servicio");
        if (nombreServicio) {
          localStorage.setItem("servicioSeleccionado", nombreServicio);
          // la navegación ocurre por el href del <a>, no hace falta window.location
        }
      });
    })
    .catch(error => console.error("Error al cargar los servicios:", error));
});
