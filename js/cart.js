/* cart.js
   Lógica del carrito usando localStorage
*/

const CART_KEY = "cart";

/* ============================
   🛒 Obtener carrito
============================ */
function getCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Error leyendo carrito desde localStorage:", e);
        return [];
    }
}

/* ============================
   💾 Guardar carrito
============================ */
function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartCount();
    } catch (e) {
        console.error("Error guardando carrito:", e);
    }
}

/* ============================
   🔢 Contar productos
============================ */
function getCartCount() {
    const cart = getCart();
    return cart.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);
}

/* ============================
   ➕ Agregar producto
============================ */
function addToCart(product, cantidad = 1) {
    if (!product || !product.id) {
        console.warn("Producto inválido:", product);
        return;
    }

    const cart = getCart();
    const index = cart.findIndex(p => Number(p.id) === Number(product.id));

    if (index >= 0) {
        cart[index].cantidad = Number(cart[index].cantidad || 0) + Number(cantidad);
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre || "Sin nombre",
            precio: Number(product.precio) || 0,
            imagen: product.imagen || "",
            cantidad: Number(cantidad) || 1
        });
    }

    saveCart(cart);
}

/* ============================
   ❌ Eliminar producto
============================ */
function removeFromCart(id) {
    const cart = getCart();
    const nuevo = cart.filter(item => Number(item.id) !== Number(id));
    saveCart(nuevo);
    return nuevo;
}

/* ============================
   🔄 Actualizar cantidad
============================ */
function updateQuantity(id, newQty) {
    newQty = Number(newQty);
    if (isNaN(newQty)) return;

    const cart = getCart();
    const index = cart.findIndex(p => Number(p.id) === Number(id));

    if (index === -1) return;

    if (newQty <= 0) {
        removeFromCart(id);
    } else {
        cart[index].cantidad = newQty;
        saveCart(cart);
    }
}

/* ============================
   💰 Total a pagar
============================ */
function getCartTotal() {
    const cart = getCart();
    return cart.reduce((acc, item) =>
        acc + Number(item.precio) * Number(item.cantidad), 0
    );
}

/* ============================
   🔔 Render contador en navbar
============================ */
function renderCartCount() {
    const badge = document.getElementById("cart-count");
    if (!badge) return;

    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? "inline-block" : "none";
}

/* ============================
   🎯 Listener: botones agregar
============================ */
function initCartListeners() {
    document.body.addEventListener("click", (e) => {
        const btn = e.target.closest(".agregar-carrito");
        if (!btn) return;

        const id = btn.dataset.id;
        const nombre = btn.dataset.nombre;
        const precio = btn.dataset.precio;
        const imagen = btn.dataset.imagen;

        if (!id || !nombre || !precio) {
            console.error("Faltan datos en botón agregar-carrito:", btn);
            return;
        }

        addToCart({ id, nombre, precio, imagen }, 1);

        // Feedback visual
        const originalText = btn.textContent;
        btn.disabled = true;
        btn.textContent = "Añadido ✔";
        btn.classList.add("btn-success");

        setTimeout(() => {
            btn.disabled = false;
            btn.textContent = originalText;
            btn.classList.remove("btn-success");
        }, 900);
    });
}

/* ============================
   🚀 Inicialización
============================ */
document.addEventListener("DOMContentLoaded", () => {
    renderCartCount();
    initCartListeners();
});
