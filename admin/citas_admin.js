document.addEventListener("DOMContentLoaded", () => {
    cargarCitas();
    cargarBarberos();
});

// =========================
// 1. Cargar citas en la tabla
// =========================
function cargarCitas() {
    fetch("obtener_citas.php")
        .then(res => res.json())
        .then(citas => {
            const tbody = document.querySelector("#tablaCitas tbody");
            tbody.innerHTML = "";

            citas.forEach(cita => {
                const tr = document.createElement("tr");

                tr.innerHTML = `
                    <td>${cita.cliente}</td>
                    <td>${cita.barbero}</td>
                    <td>${cita.fecha_cita}</td>
                    <td>${cita.hora_cita}</td>
                    <td>${cita.servicio}</td>
                    <td>${cita.estado}</td>
                    <td>
                        <button class="btn btn-sm btn-primary me-1" onclick="abrirModal(${cita.id_cita})">Editar</button>
                        <button class="btn btn-sm btn-danger" onclick="eliminarCita(${cita.id_cita})">Eliminar</button>
                    </td>
                `;

                tr.dataset.cita = JSON.stringify(cita);
                tbody.appendChild(tr);
            });
        })
        .catch(err => console.error("Error al cargar citas:", err));
}

// =====================================
// 2. Cargar lista de barberos en el modal
// =====================================
function cargarBarberos() {
    fetch("obtener_barberos.php")
        .then(res => res.json())
        .then(barberos => {
            const select = document.getElementById("edit_barbero");
            select.innerHTML = "";

            barberos.forEach(b => {
                const option = document.createElement("option");
                option.value = b.id_barbero;
                option.textContent = b.nombre;
                select.appendChild(option);
            });
        })
        .catch(err => console.error("Error al cargar barberos:", err));
}

// =============================
// 3. Abrir modal con los datos
// =============================
function abrirModal(id) {
    const filas = document.querySelectorAll("#tablaCitas tbody tr");

    let cita = null;

    filas.forEach(f => {
        const data = JSON.parse(f.dataset.cita);
        if (data.id_cita == id) cita = data;
    });

    if (!cita) return;

    // Llenar campos del modal
    document.getElementById("edit_id_cita").value = cita.id_cita;
    document.getElementById("edit_cliente").value = cita.cliente;
    document.getElementById("edit_barbero").value = cita.id_barbero;
    document.getElementById("edit_fecha").value = cita.fecha_cita;
    document.getElementById("edit_hora").value = cita.hora_cita;
    document.getElementById("edit_servicio").value = cita.servicio;

    // Llenar select de estado correctamente
    const selectEstado = document.getElementById("edit_estado");
    selectEstado.innerHTML = "";
    const estados = ["pendiente", "completada", "cancelada"];
    estados.forEach(est => {
        const option = document.createElement("option");
        option.value = est;
        option.textContent = est;
        if (est.toLowerCase() === cita.estado.trim().toLowerCase()) {
            option.selected = true;
        }
        selectEstado.appendChild(option);
    });

    let modal = new bootstrap.Modal(document.getElementById("modalEditarCita"));
    modal.show();
}

// =========================================
// 4. Guardar cambios (update)
// =========================================
document.getElementById("formEditarCita").addEventListener("submit", function(e) {
    e.preventDefault();

    const datos = new FormData();
    datos.append("id_cita", document.getElementById("edit_id_cita").value);
    datos.append("id_barbero", document.getElementById("edit_barbero").value);
    datos.append("fecha_cita", document.getElementById("edit_fecha").value);
    datos.append("hora_cita", document.getElementById("edit_hora").value);
    datos.append("servicio", document.getElementById("edit_servicio").value);
    datos.append("estado", document.getElementById("edit_estado").value);

    fetch("actualizar_cita.php", {
        method: "POST",
        body: datos
    })
    .then(res => res.text())
    .then(respuesta => {
        alert(respuesta);
        cargarCitas();
        bootstrap.Modal.getInstance(document.getElementById("modalEditarCita")).hide();
    })
    .catch(err => console.error("Error al actualizar:", err));
});

// =========================================
// 5. Eliminar cita
// =========================================
function eliminarCita(id_cita) {
    if (!confirm("¿Seguro que deseas eliminar esta cita?")) return;

    const datos = new FormData();
    datos.append("id_cita", id_cita);

    fetch("eliminar_cita.php", {
        method: "POST",
        body: datos
    })
    .then(res => res.json())
    .then(data => {
        alert(data.message);
        cargarCitas();
    })
    .catch(err => console.error("Error al eliminar cita:", err));
}


document.addEventListener("DOMContentLoaded", () => {
    const btnLogin = document.getElementById("btnLogin");
    const saludo = document.getElementById("saludo");
    const btnLogout = document.getElementById("btnLogout");

    // Si no existen los elementos, salimos para evitar errores
    if (!btnLogin || !saludo || !btnLogout) return;

    const usuario = localStorage.getItem("usuario");

    if (usuario) {
        // Ocultar botón de login
        btnLogin.style.display = "none";

        // Mostrar botón de cerrar sesión
        btnLogout.style.display = "inline-block";

        // Mostrar saludo según la hora
        const hora = new Date().getHours();
        let mensaje = "";

        if (hora >= 5 && hora < 12) mensaje = "¡Buenos días";
        else if (hora >= 12 && hora < 19) mensaje = "¡Buenas tardes";
        else mensaje = "¡Buenas noches";

        saludo.style.display = "inline-block";
        saludo.textContent = `${mensaje}, ${usuario}!`;
    } else {
        // Aseguramos estado inicial
        btnLogin.style.display = "inline-block";
        saludo.style.display = "none";
        btnLogout.style.display = "none";
    }

    // Acción de logout -> redirige al php logout que destruye session y limpia localStorage
    btnLogout.addEventListener("click", () => {
        window.location.href = "../php/logout.php";
    });
});