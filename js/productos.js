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
// CARGAR PRODUCTOS
// ============================
document.addEventListener("DOMContentLoaded", async () => {
    try {
        const response = await fetch("data/productos.json");
        const productos = await response.json();

        const contenedor = document.getElementById("lista-productos");
        const params = new URLSearchParams(window.location.search);
        const search = params.get("search") ? normalizar(params.get("search")) : "";

        let productosFiltrados = productos;

        // ============================
        // FILTRAR POR NOMBRE O DESCRIPCIÓN (SIN ACENTOS)
        // ============================
        if (search) {
            productosFiltrados = productos.filter(p =>
                normalizar(p.nombre).includes(search) ||
                normalizar(p.descripcion).includes(search)
            );
        }

        // ============================
        // SI NO HAY RESULTADOS
        // ============================
        if (productosFiltrados.length === 0) {
            contenedor.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <h3>No se encontraron resultados para "<strong>${params.get("search")}</strong>"</h3>
                    <a href="productos.html" class="btn btn-primary mt-3">Volver</a>
                </div>
            `;
            return;
        }

        // ============================
        // MOSTRAR PRODUCTOS
        // ============================
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
        // EVENTO DETALLE
        // ============================
        document.querySelectorAll(".ver-detalle").forEach(btn => {
            btn.addEventListener("click", function () {
                const id = this.dataset.id;
                const nombre = this.dataset.nombre;
                const descripcion = this.dataset.descripcion;
                const precio = this.dataset.precio;
                const imagen = this.dataset.imagen;

                document.getElementById("modalTitulo").innerText = nombre;
                document.getElementById("modalDescripcion").innerText = descripcion;
                document.getElementById("modalPrecio").innerText = precio;
                document.getElementById("modalImagen").src = imagen;

                // Botón para carrito dentro del modal
                const addCart = document.getElementById("modalAddCartBtn");
                addCart.dataset.id = id;
                addCart.dataset.nombre = nombre;
                addCart.dataset.precio = precio;
                addCart.dataset.imagen = imagen;

                new bootstrap.Modal(document.getElementById("modalProducto")).show();
            });
        });

        // ============================
        // AGREGAR AL CARRITO
        // ============================
        document.getElementById("modalAddCartBtn").addEventListener("click", function () {
            const producto = {
                id: this.dataset.id,
                nombre: this.dataset.nombre,
                precio: Number(this.dataset.precio),
                imagen: this.dataset.imagen,
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

    } catch (error) {
        console.error("Error cargando productos:", error);
    }
});

