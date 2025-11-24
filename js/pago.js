function displayCartSummary(cart) {
    const carritoHtml = document.getElementById("carrito_html");
    let total = 0;
    let html = `<div class="card"><div class="card-body">`;

    cart.forEach(item => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        html += `
            <div class="d-flex justify-content-between border-bottom py-2">
                <div><strong>${item.nombre}</strong><br><small>${item.cantidad} x $${item.precio} MXN</small></div>
                <div>$${subtotal} MXN</div>
            </div>
        `;
    });

    html += `
        <div class="d-flex justify-content-between mt-3 pt-2 border-top">
            <strong>Total:</strong>
            <strong class="text-primary">$${total} MXN</strong>
        </div>
    </div></div>`;

    carritoHtml.innerHTML = html;
    return total;
}

document.addEventListener("DOMContentLoaded", () => {
    const cart = JSON.parse(localStorage.getItem("cart")) || [];

    if (cart.length === 0) {
        document.getElementById("carrito_html").innerHTML = `<div class="alert alert-warning">Carrito vacío</div>`;
        return;
    }

    const total = displayCartSummary(cart);

    paypal.Buttons({
        createOrder: async () => {
            const response = await fetch('php/crear_orden.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cart })
            });
            const data = await response.json();
            if (!data.id) {
                document.getElementById("mensaje").innerHTML = `<div class="alert alert-danger">Error al crear la orden.</div>`;
                throw new Error('No se recibió orderID');
            }
            return data.id;
        },
        onApprove: async (data) => {
            const response = await fetch('php/capturar_orden.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ orderID: data.orderID })
            });
            const result = await response.json();
            if (result.status === 'COMPLETED') {
                document.getElementById("mensaje").innerHTML = `<div class="alert alert-success">Pago completado correctamente!</div>`;
                localStorage.removeItem('cart');
                document.getElementById("carrito_html").innerHTML = "";
            } else {
                document.getElementById("mensaje").innerHTML = `<div class="alert alert-danger">Pago no completado.</div>`;
            }
        },
        onError: (err) => {
            document.getElementById("mensaje").innerHTML = `<div class="alert alert-danger">Error en el pago.</div>`;
            console.error(err);
        }
    }).render('#paypal-button-container');
});
