// Función principal - ACTUALIZADA
document.addEventListener("DOMContentLoaded", async () => {
    const walletContainer = document.getElementById("wallet_container");
    const carritoHtml = document.getElementById("carrito_html");

    if (!walletContainer) {
        console.error("No se encontró el contenedor de Mercado Pago");
        return;
    }

    // Obtener carrito del localStorage - FORMA MÁS SEGURA
    let cart = [];
    try {
        const cartData = localStorage.getItem("cart");
        console.log("📦 Raw cart data from localStorage:", cartData);
        
        if (cartData) {
            cart = JSON.parse(cartData);
        }
        
        // Asegurarnos que es un array
        if (!Array.isArray(cart)) {
            console.warn("Cart no es array, convirtiendo:", cart);
            cart = [];
        }
        
        console.log("🛒 Carrito procesado:", cart);
        
    } catch (e) {
        console.error("❌ Error leyendo carrito:", e);
        cart = [];
    }

    // Validar carrito de forma más estricta
    const validCart = cart.filter(item => {
        return item && 
               typeof item === 'object' && 
               (item.nombre || item.name) && 
               (item.precio || item.price) &&
               (item.cantidad || item.quantity);
    });

    console.log("✅ Carrito validado:", validCart);

    if (validCart.length === 0) {
        carritoHtml.innerHTML = `
            <div class="alert alert-warning">
                <h6 class="alert-heading">Carrito vacío o inválido</h6>
                <p class="mb-3">No hay productos válidos en tu carrito.</p>
                <div class="mt-2">
                    <a href="productos.html" class="btn btn-primary me-2">Ir a Productos</a>
                    <button class="btn btn-outline-secondary" onclick="localStorage.removeItem('cart'); location.reload();">
                        Limpiar Carrito
                    </button>
                </div>
            </div>
        `;
        walletContainer.innerHTML = "";
        return;
    }

    // Mostrar resumen del carrito
    displayCartSummary(validCart);

    // Crear preferencia e inicializar Mercado Pago
    try {
        console.log("📤 Enviando carrito al backend...", validCart);
        
        // Preparar datos para enviar
        const requestData = {
            cart: validCart.map(item => ({
                id: item.id || Math.random().toString(36).substr(2, 9),
                nombre: item.nombre || item.name,
                precio: parseFloat(item.precio || item.price),
                cantidad: parseInt(item.cantidad || item.quantity || 1)
            }))
        };
        
        console.log("📨 Datos a enviar:", requestData);

        const response = await fetch("php/crear_preferencia.php", {
            method: "POST",
            headers: { 
                "Content-Type": "application/json",
                "Accept": "application/json"
            },
            body: JSON.stringify(requestData)
        });

        console.log("📥 Estado de respuesta:", response.status, response.statusText);

        const responseText = await response.text();
        console.log("📄 Respuesta completa del servidor:", responseText);

        // Verificar si es HTML (error)
        if (responseText.trim().startsWith('<!DOCTYPE') || 
            responseText.includes('<html') || 
            responseText.includes('<?php') ||
            responseText.includes('Warning:') ||
            responseText.includes('Notice:')) {
            console.error("❌ El servidor devolvió HTML/errores en lugar de JSON");
            throw new Error("Error de configuración del servidor. Contacta al administrador.");
        }

        let data;
        try {
            data = JSON.parse(responseText);
        } catch (parseError) {
            console.error("❌ Error parseando JSON:", parseError);
            console.error("📄 Texto que falló:", responseText);
            throw new Error("Respuesta inválida del servidor. Intenta nuevamente.");
        }

        if (!response.ok || data.error) {
            const errorMsg = data.error || data.message || "No se pudo crear la sesión de pago";
            throw new Error(errorMsg);
        }

        if (!data.id) {
            throw new Error("No se recibió ID de preferencia del servidor");
        }

        console.log("✅ Preferencia creada exitosamente:", data.id);

        // Inicializar Mercado Pago
        const mp = new MercadoPago("APP_USR-e51bb0bd-71f1-435d-9a31-66fea4d2f5c4", {
            locale: "es-MX"
        });

        // Limpiar contenedor y mostrar wallet
        walletContainer.innerHTML = "";
        
        await mp.bricks().create("wallet", "wallet_container", {
            initialization: { 
                preferenceId: data.id 
            },
            customization: {
                texts: { 
                    valueProp: "smart_option" 
                }
            }
        });

        console.log("🎉 Wallet de Mercado Pago inicializado correctamente");

    } catch (error) {
        console.error("❌ Error en el proceso de pago:", error);
        showError(error.message);
    }
});