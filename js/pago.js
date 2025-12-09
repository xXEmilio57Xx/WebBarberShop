let descuentoActual = 0; // Descuento aplicado
let subtotalGlobal = 0;
let ivaGlobal = 0;
let totalFinalGlobal = 0;

// ----------------------------
// MOSTRAR RESUMEN DEL CARRITO
// ----------------------------
function displayCartSummary(cart) {
    const carritoHtml = document.getElementById("carrito_html");

    let subtotal = 0;
    let html = `
        <div class="card">
        <div class="card-header bg-light">
            <h5 class="mb-0">Resumen de tu compra</h5>
        </div>
        <div class="card-body">
    `;

    cart.forEach(item => {
        const itemSubtotal = item.precio * item.cantidad;
        subtotal += itemSubtotal;

        html += `
            <div class="d-flex justify-content-between border-bottom py-2">
                <div>
                    <strong>${item.nombre}</strong><br>
                    <small>${item.cantidad} x $${item.precio} MXN</small>
                </div>
                <div>$${itemSubtotal.toFixed(2)} MXN</div>
            </div>
        `;
    });

    const iva = subtotal * 0.16;
    let totalFinal = subtotal + iva - descuentoActual;
    if (totalFinal < 0) totalFinal = 0;

    html += `
        <div class="d-flex justify-content-between mt-3">
            <strong>Subtotal:</strong>
            <strong>$${subtotal.toFixed(2)} MXN</strong>
        </div>

        <div class="d-flex justify-content-between">
            <strong>IVA (16%):</strong>
            <strong>$${iva.toFixed(2)} MXN</strong>
        </div>

        <div class="d-flex justify-content-between mt-2 text-success" id="descuentoRow" style="${descuentoActual > 0 ? "flex" : "none"};">
            <strong>Descuento:</strong>
            <strong id="descuentoTexto">-$${descuentoActual.toFixed(2)} MXN</strong>
        </div>

        <div class="d-flex justify-content-between mt-3 pt-2 border-top">
            <strong>Total final:</strong>
            <strong id="totalFinalTexto" class="text-primary">$${totalFinal.toFixed(2)} MXN</strong>
        </div>

        </div>
        </div>
    `;

    carritoHtml.innerHTML = html;

    // Guardar globales
    subtotalGlobal = subtotal;
    ivaGlobal = iva;
    totalFinalGlobal = totalFinal;

    return { subtotal, iva, totalFinal };
}

// ----------------------------
// PAYPAL
// ----------------------------
function inicializarPago(cart) {

    document.getElementById("paypal-button-container").innerHTML = "";

    paypal.Buttons({
        createOrder: async () => {

            const response = await fetch("php/crear_orden.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    cart: cart,
                    descuento: descuentoActual,
                    subtotal: subtotalGlobal,
                    iva: ivaGlobal,
                    totalFinal: totalFinalGlobal
                })
            });

            const data = await response.json();

            return data.id;
        },

        onApprove: async (data) => {
            const response = await fetch("php/capturar_orden.php", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderID: data.orderID })
            });

            const result = await response.json();

            if (result.status === "COMPLETED") {
                document.getElementById("mensaje").innerHTML =
                    `<div class="alert alert-success">¡Pago completado exitosamente!</div>`;

                localStorage.removeItem("cart");
                document.getElementById("carrito_html").innerHTML = "";
            }
        }
    }).render("#paypal-button-container");
}

// ----------------------------
// CARGAR CARRITO AL INICIO
// ----------------------------
document.addEventListener("DOMContentLoaded", () => {

    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        document.getElementById("carrito_html").innerHTML =
            `<div class="alert alert-warning">Carrito vacío</div>`;
        return;
    }

    displayCartSummary(cart);

    inicializarPago(cart);

    // -----------------------------------
    // APLICAR CUPÓN
    // -----------------------------------
    document.getElementById("btnAplicarCupon").addEventListener("click", async () => {

        const cupon = document.getElementById("cuponInput").value.trim();
        const cuponMensaje = document.getElementById("cuponMensaje");

        if (!cupon) {
            cuponMensaje.innerHTML = `<div class="text-danger">Ingresa un cupón.</div>`;
            return;
        }

        const response = await fetch("php/validar_cupon.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cupon })
        });

        const data = await response.json();

        if (!data.valido) {
            cuponMensaje.innerHTML = `<div class="text-danger">${data.mensaje}</div>`;
            return;
        }

        descuentoActual = parseFloat(data.descuento);
        cuponMensaje.innerHTML = `<div class="text-success">¡Cupón aplicado correctamente!</div>`;

        displayCartSummary(cart);

        inicializarPago(cart);
    });
});

