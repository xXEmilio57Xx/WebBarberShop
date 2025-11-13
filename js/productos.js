document.addEventListener("DOMContentLoaded", () => {
  const contenedor = document.getElementById("lista-productos");
  const modal = new bootstrap.Modal(document.getElementById("modalProducto"));
  const modalTitulo = document.getElementById("modalTitulo");
  const modalImagen = document.getElementById("modalImagen");
  const modalDescripcion = document.getElementById("modalDescripcion");
  const modalPrecio = document.getElementById("modalPrecio");
  const listaReseñas = document.getElementById("listaReseñas");
  const reseñaForm = document.getElementById("reseñaForm");
  const producto_id_input = document.getElementById("producto_id");

  fetch("php/productos.php")
    .then(res => res.json())
    .then(productos => {
      productos.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("col-md-4", "mb-4");
        tarjeta.innerHTML = `
          <div class="card h-100 shadow-sm producto-card">
            <img src="${producto.imagen}" class="card-img-top producto-img" alt="${producto.nombre}" data-id="${producto.id}">
            <div class="card-body text-center">
              <h5 class="card-title fw-bold">${producto.nombre}</h5>
              <p class="card-text text-muted">${producto.descripcion}</p>
              <p class="fw-semibold fs-5 text-success">$${producto.precio} MXN</p>
            </div>
          </div>
        `;
        contenedor.appendChild(tarjeta);
      });

      // Abrir modal al dar clic en imagen
      contenedor.addEventListener("click", e => {
        if (e.target.classList.contains("producto-img")) {
          const id = e.target.dataset.id;
          const producto = productos.find(p => p.id == id);

          modalTitulo.textContent = producto.nombre;
          modalImagen.src = producto.imagen;
          modalDescripcion.textContent = producto.descripcion;
          modalPrecio.textContent = producto.precio;
          producto_id_input.value = id;

          // Limpiar reseñas antes de cargar
          listaReseñas.innerHTML = "";

          // Cargar reseñas
          fetch(`php/get_reseñas.php?id_producto=${id}`)
            .then(res => res.json())
            .then(reseñas => {
              if (reseñas.length === 0) {
                listaReseñas.innerHTML = "<p>No hay reseñas aún.</p>";
              } else {
                reseñas.forEach(r => {
                  listaReseñas.innerHTML += `
                    <div class="border rounded p-2 mb-2 text-start">
                      <div class="text-warning">${"★".repeat(r.calificacion)}${"☆".repeat(5-r.calificacion)}</div>
                      <p class="mb-1"><strong>${r.usuario}</strong></p>
                      <p class="mb-0">${r.comentario}</p>
                    </div>
                  `;
                });
              }
            });

          modal.show();
        }
      });

      // Enviar reseña
      reseñaForm.addEventListener("submit", e => {
        e.preventDefault();
        const formData = new FormData(reseñaForm);

        fetch("php/add_reseña.php", {
          method: "POST",
          body: formData
        })
        .then(res => res.json())
        .then(resp => {
          if (resp.success) {
            // Recargar reseñas sin cerrar modal
            const id = producto_id_input.value;
            listaReseñas.innerHTML = "";
            fetch(`php/get_reseñas.php?id_producto=${id}`)
              .then(res => res.json())
              .then(reseñas => {
                reseñas.forEach(r => {
                  listaReseñas.innerHTML += `
                    <div class="border rounded p-2 mb-2 text-start">
                      <div class="text-warning">${"★".repeat(r.calificacion)}${"☆".repeat(5-r.calificacion)}</div>
                      <p class="mb-1"><strong>${r.usuario}</strong></p>
                      <p class="mb-0">${r.comentario}</p>
                    </div>
                  `;
                });
              });

            reseñaForm.reset();
          } else {
            alert(resp.error || "Error al enviar reseña");
          }
        });
      });
    });
});
