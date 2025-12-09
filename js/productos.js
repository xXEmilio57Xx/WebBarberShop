// ============================
// QUITAR ACENTOS
// ============================
function normalizar(texto) {
    return texto
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
}

// ============================
// CARGAR PRODUCTOS Y MODAL
// ============================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("data/productos.json");
        const productos = await response.json();

        const contenedor = document.getElementById("lista-productos");
        const params = new URLSearchParams(window.location.search);
        const search = params.get("search") ? normalizar(params.get("search")) : "";

        let productosFiltrados = productos;

        if (search) {
            productosFiltrados = productos.filter(p =>
                normalizar(p.nombre).includes(search) ||
                normalizar(p.descripcion).includes(search)
            );
        }

        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <h3>No se encontraron resultados para "<strong>${params.get("search")}</strong>"</h3>
                    <a href="productos.html" class="btn btn-primary mt-3">Volver</a>
                </div>
            `;
            return;
        }

        contenedor.innerHTML = "";
        productosFiltrados.forEach(prod => {
            const card = `
            <div class="col-md-4 mb-4">
                <div class="card shadow-sm h-100">
                    <img src="${prod.imagen}" class="card-img-top" alt="${prod.nombre}">
                    <div class="card-body">
                        <h5 class="card-title">${prod.nombre}</h5>
                        <p class="card-text">${prod.descripcion.substring(0, 70)}...</p>
                        <p class="fw-bold">$${prod.precio}</p>
                        <button 
                            class="btn btn-primary ver-detalle"
                            data-id="${prod.id}"
                            data-nombre="${prod.nombre}"
                            data-descripcion="${prod.descripcion}"
                            data-precio="${prod.precio}"
                            data-imagen="${prod.imagen}"
                        >
                            Ver más
                        </button>
                    </div>
                </div>
            </div>
            `;
            contenedor.innerHTML += card;
        });

        // ============================
        // MODAL DETALLE PRODUCTO
        // ============================
        const modal = new bootstrap.Modal(document.getElementById("modalProducto"));
        const modalTitulo = document.getElementById("modalTitulo");
        const modalDescripcion = document.getElementById("modalDescripcion");
        const modalPrecio = document.getElementById("modalPrecio");
        const modalImagen = document.getElementById("modalImagen");
        const modalAddCartBtn = document.getElementById("modalAddCartBtn");
        const productoIdInput = document.getElementById("producto_id");
        const listaReseñasDiv = document.getElementById("listaReseñas");

        document.querySelectorAll(".ver-detalle").forEach(btn => {
            btn.addEventListener("click", function () {
                const id = this.dataset.id;
                const nombre = this.dataset.nombre;
                const descripcion = this.dataset.descripcion;
                const precio = this.dataset.precio;
                const imagen = this.dataset.imagen;

                modalTitulo.innerText = nombre;
                modalDescripcion.innerText = descripcion;
                modalPrecio.innerText = precio;
                modalImagen.src = imagen;

                productoIdInput.value = id;

                modalAddCartBtn.dataset.id = id;
                modalAddCartBtn.dataset.nombre = nombre;
                modalAddCartBtn.dataset.precio = precio;
                modalAddCartBtn.dataset.imagen = imagen;

                cargarReseñas(id);

                modal.show();
            });
        });

        // ============================
        // AGREGAR AL CARRITO
        // ============================
        modalAddCartBtn.addEventListener("click", () => {
            const producto = {
                id: modalAddCartBtn.dataset.id,
                nombre: modalAddCartBtn.dataset.nombre,
                precio: Number(modalAddCartBtn.dataset.precio),
                imagen: modalAddCartBtn.dataset.imagen,
                cantidad: 1
            };

            let carrito = JSON.parse(localStorage.getItem("carrito")) || [];
            const existe = carrito.find(item => item.id === producto.id);

            if (existe) {
                existe.cantidad++;
            } else {
                carrito.push(producto);
            }

            localStorage.setItem("carrito", JSON.stringify(carrito));
            alert("Producto agregado al carrito");
        });

        // ============================
        // RESEÑAS
        // ============================
        async function cargarReseñas(idProducto) {
            listaReseñasDiv.innerHTML = "<p>Cargando reseñas...</p>";
            try {
                const res = await fetch(`php/get_reseñas.php?id_producto=${idProducto}`);
                const data = await res.json();

                if (!data || data.length === 0) {
                    listaReseñasDiv.innerHTML = "<p>No hay reseñas aún.</p>";
                    return;
                }

                let html = "";
                data.forEach(r => {
                    html += `
                        <div class="card mb-2">
                            <div class="card-body">
                                <strong>${r.usuario}</strong> - ${r.calificacion} ⭐<br>
                                <small class="text-muted">${r.fecha}</small>
                                <p>${r.comentario}</p>
                            </div>
                        </div>
                    `;
                });

                listaReseñasDiv.innerHTML = html;
            } catch (err) {
                listaReseñasDiv.innerHTML = "<p>Error al cargar reseñas.</p>";
                console.error(err);
            }
        }

        // Enviar reseña
        const reseñaForm = document.getElementById("reseñaForm");
        reseñaForm.addEventListener("submit", async (e) => {
            e.preventDefault();

            const productoId = productoIdInput.value;
            const calificacion = document.getElementById("calificacion").value;
            const comentario = document.getElementById("comentario").value;

            if (!productoId || !calificacion || !comentario) {
                alert("Todos los campos son obligatorios.");
                return;
            }

            try {
                const formData = new FormData();
                formData.append("producto_id", productoId);
                formData.append("calificacion", calificacion);
                formData.append("comentario", comentario);

                const res = await fetch("php/add_reseña.php", {
                    method: "POST",
                    body: formData
                });

                const data = await res.json();

                if (data.success) {
                    reseñaForm.reset();
                    cargarReseñas(productoId);
                } else {
                    alert(data.error || "Error al enviar la reseña.");
                }

            } catch (err) {
                console.error(err);
                alert("Error al enviar la reseña.");
            }
        });

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
});
