/* cart.js
   Lógica del carrito usando localStorage
*/

const CART_KEY = "cart";

// Obtener carrito (array). Si no existe, devuelve array vacío.
function getCart() {
    try {
        const raw = localStorage.getItem(CART_KEY);
        return raw ? JSON.parse(raw) : [];
    } catch (e) {
        console.error("Error leyendo carrito desde localStorage:", e);
        return [];
    }
}

// Guardar carrito (reemplaza)
function saveCart(cart) {
    try {
        localStorage.setItem(CART_KEY, JSON.stringify(cart));
        renderCartCount(); // actualizar contador en navbar
    } catch (e) {
        console.error("Error guardando carrito en localStorage:", e);
    }
}

// Devuelve el total de unidades en el carrito
function getCartCount() {
    const cart = getCart();
    return cart.reduce((acc, item) => acc + Number(item.cantidad || 0), 0);
}

// Añadir producto (objeto con al menos id, nombre, precio, imagen)
// Si ya existe agrega a la cantidad, si no lo crea con cantidad=1 (o cantidad dada)
function addToCart(product, cantidad = 1) {
    if (!product || !product.id) return;
    const cart = getCart();
    const index = cart.findIndex(p => Number(p.id) === Number(product.id));
    if (index > -1) {
        cart[index].cantidad = Number(cart[index].cantidad || 0) + Number(cantidad);
    } else {
        cart.push({
            id: product.id,
            nombre: product.nombre,
            precio: Number(product.precio) || 0,
            imagen: product.imagen || "",
            cantidad: Number(cantidad) || 1
        });
    }
    saveCart(cart);
}

// Eliminar producto por id
function removeFromCart(id) {
    const cart = getCart();
    const nuevo = cart.filter(item => Number(item.id) !== Number(id));
    saveCart(nuevo);
    return nuevo;
}

// Actualizar cantidad. Si newQty<=0 lo elimina.
function updateQuantity(id, newQty) {
    const cart = getCart();
    const index = cart.findIndex(p => Number(p.id) === Number(id));
    if (index === -1) return;
    newQty = Number(newQty);
    if (isNaN(newQty) || newQty <= 0) {
        removeFromCart(id);
    } else {
        cart[index].cantidad = newQty;
        saveCart(cart);
    }
}

// Calcular total (suma precio * cantidad)
function getCartTotal() {
    const cart = getCart();
    // Calcular con precisión simple (MXN, sin decimales complicados)
    return cart.reduce((acc, item) => acc + (Number(item.precio) * Number(item.cantidad)), 0);
}

// Renderizar contador (coloca el número en el elemento con id="cart-count")
function renderCartCount() {
    const badge = document.getElementById("cart-count");
    if (!badge) return;
    const count = getCartCount();
    badge.textContent = count;
    // ocultar badge si es cero
    badge.style.display = count > 0 ? "inline-block" : "none";
}

// Inicializar listeners globales (delegación para botones "agregar-carrito")
function initCartListeners() {
    // Delegación: escucha clicks en todo el body y filtra por clase
    document.body.addEventListener("click", (e) => {
        const btn = e.target.closest(".agregar-carrito");
        if (!btn) return;
        // leer atributos data-* desde el botón (asegúrate de que estén puestos)
        const id = btn.getAttribute("data-id");
        const nombre = btn.getAttribute("data-nombre");
        const precio = btn.getAttribute("data-precio");
        const imagen = btn.getAttribute("data-imagen");
        // Si no tienes todos los data- en el botón, puedes buscar en el DOM el resto (pero es mejor incluirlos)
        addToCart({ id, nombre, precio, imagen }, 1);
        // Retroalimentación breve: pequeño toast o alert (aquí simple)
        btn.classList.add("btn-success");
        btn.textContent = "Añadido";
        setTimeout(() => {
            btn.classList.remove("btn-success");
            btn.textContent = "Agregar al carrito";
        }, 900);
    });
}

// Ejecutar al cargar la página
document.addEventListener("DOMContentLoaded", () => {
    renderCartCount();
    initCartListeners();
});
