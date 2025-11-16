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
  const modalAddCartBtn = document.getElementById("modalAddCartBtn");

  fetch("php/productos.php")
    .then(res => res.json())
    .then(productos => {

      // ============================
      // MOSTRAR TARJETAS DE PRODUCTOS
      // ============================
      productos.forEach(producto => {
        const tarjeta = document.createElement("div");
        tarjeta.classList.add("col-md-4", "mb-4");

        tarjeta.innerHTML = `
          <div class="card h-100 shadow-sm producto-card">
            <img src="${producto.imagen}" 
                 class="card-img-top producto-img" 
                 alt="${producto.nombre}" 
                 data-id="${producto.id}">

            <div class="card-body text-center">
              <h5 class="card-title fw-bold">${producto.nombre}</h5>
              <p class="card-text text-muted">${producto.descripcion}</p>
              <p class="fw-semibold fs-5 text-success">$${producto.precio} MXN</p>

              <!-- BOTÓN AGREGAR CARRITO DESDE LA TARJETA -->
              <button 
                class="btn btn-outline-primary agregar-carrito"
                data-id="${producto.id}"
                data-nombre="${producto.nombre}"
                data-precio="${producto.precio}"
                data-imagen="${producto.imagen}">
                Agregar al carrito
              </button>
            </div>
          </div>
        `;

        contenedor.appendChild(tarjeta);
      });

      // ===================================================
      // ABRIR MODAL AL HACER CLIC EN UNA IMAGEN
      // ===================================================
      contenedor.addEventListener("click", e => {
        if (e.target.classList.contains("producto-img")) {
          const id = e.target.dataset.id;
          const producto = productos.find(p => p.id == id);

          // Rellenar modal con la info del producto
          modalTitulo.textContent = producto.nombre;
          modalImagen.src = producto.imagen;
          modalDescripcion.textContent = producto.descripcion;
          modalPrecio.textContent = producto.precio;
          producto_id_input.value = id;

          // ⚡ ACTUALIZAR BOTÓN "AGREGAR AL CARRITO" DEL MODAL
          modalAddCartBtn.dataset.id = producto.id;
          modalAddCartBtn.dataset.nombre = producto.nombre;
          modalAddCartBtn.dataset.precio = producto.precio;
          modalAddCartBtn.dataset.imagen = producto.imagen;

          // Limpiar reseñas antes de cargar
          listaReseñas.innerHTML = "";

          // Cargar reseñas desde backend
          fetch(`php/get_reseñas.php?id_producto=${id}`)
            .then(res => res.json())
            .then(reseñas => {
              if (reseñas.length === 0) {
                listaReseñas.innerHTML = "<p>No hay reseñas aún.</p>";
              } else {
                reseñas.forEach(r => {
                  listaReseñas.innerHTML += `
                    <div class="border rounded p-2 mb-2 text-start">
                      <div class="text-warning">
                        ${"★".repeat(r.calificacion)}${"☆".repeat(5 - r.calificacion)}
                      </div>
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

      // ====================
      // ENVIAR UNA RESEÑA
      // ====================
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
              const id = producto_id_input.value;

              listaReseñas.innerHTML = "";

              fetch(`php/get_reseñas.php?id_producto=${id}`)
                .then(res => res.json())
                .then(reseñas => {
                  reseñas.forEach(r => {
                    listaReseñas.innerHTML += `
                      <div class="border rounded p-2 mb-2 text-start">
                        <div class="text-warning">
                          ${"★".repeat(r.calificacion)}${"☆".repeat(5 - r.calificacion)}
                        </div>
                        <p><strong>${r.usuario}</strong></p>
                        <p>${r.comentario}</p>
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
