function displayCartSummary(cart, descuento = 0) {
    const carritoHtml = document.getElementById("carrito_html");

    let subtotal = 0;

    let html = `
        <div class="card">
        <div class="card-header bg-light">
            <h5 class="mb-0">Resumen de tu compra</h5>
        </div>
        <div class="card-body">
    `;

    // 🔹 Productos listados
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

    // 🔹 Mostrar SUBTOTAL
    html += `
        <div class="d-flex justify-content-between mt-3 pt-2 border-top">
            <strong>Subtotal:</strong>
            <strong>$${subtotal.toFixed(2)} MXN</strong>
        </div>
    `;

    // 🔹 DESCUENTO
    if (descuento > 0) {
        html += `
            <div class="d-flex justify-content-between mt-2 text-success">
                <strong>Descuento:</strong>
                <strong>-$${descuento.toFixed(2)} MXN</strong>
            </div>
        `;
    }

    // 🔹 IVA 16%
    const base = subtotal - descuento;
    const iva = base * 0.16;

    html += `
        <div class="d-flex justify-content-between mt-2">
            <strong>IVA (16%):</strong>
            <strong>$${iva.toFixed(2)} MXN</strong>
        </div>
    `;

    // 🔹 TOTAL FINAL
    const totalFinalCalculado = base + iva;

    html += `
        <div class="d-flex justify-content-between mt-3 pt-2 border-top">
            <strong>Total final:</strong>
            <strong id="totalFinalTexto" class="text-primary">$${totalFinalCalculado.toFixed(2)} MXN</strong>
        </div>
        </div>
        </div>
    `;

    carritoHtml.innerHTML = html;

    return totalFinalCalculado;
}

