document.addEventListener("DOMContentLoaded", () => {
  // ======= ELEMENTOS =======
  const selectHora = document.getElementById("hora");
  const selectServicio = document.getElementById("servicio");
  const selectBarbero = document.getElementById("id_barbero"); // recuerda agregar este select en HTML
  const inputFecha = document.getElementById("fecha");

  const mensaje = document.getElementById("mensaje");

  // ====== CARGAR SERVICIO GUARDADO ======
  const servicioGuardado = localStorage.getItem("servicioSeleccionado");
  if (servicioGuardado) {
    const opciones = selectServicio.options;
    for (let i = 0; i < opciones.length; i++) {
      if (opciones[i].textContent.trim().toLowerCase() === servicioGuardado.trim().toLowerCase()) {
        selectServicio.selectedIndex = i;
        break;
      }
    }
    localStorage.removeItem("servicioSeleccionado");
  }

  // ====== GENERAR HORARIOS DE 09:00 A 18:00 CADA 20 MIN ======
  function generarHorarios() {
    const horaInicio = 9 * 60; // 9:00 en minutos
    const horaFin = 18 * 60;   // 18:00 en minutos

    selectHora.innerHTML = '<option value="">Selecciona una hora</option>'; // reset

    for (let minutos = horaInicio; minutos <= horaFin; minutos += 20) {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const horaFormateada = `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
      const option = document.createElement("option");
      option.value = horaFormateada;
      option.textContent = horaFormateada;
      selectHora.appendChild(option);
    }
  }

  generarHorarios();

  // ====== BLOQUEAR HORAS YA OCUPADAS ======
  function bloquearHoras() {
    const fecha = inputFecha.value;
    const idBarbero = selectBarbero.value;

    if (!fecha || !idBarbero) return;

    fetch(`php/obtener_horarios.php?id_barbero=${idBarbero}&fecha=${fecha}`)
      .then(res => res.json())
      .then(horasOcupadas => {
        // habilitar todas primero
        Array.from(selectHora.options).forEach(opt => opt.disabled = false);

        // deshabilitar horas ocupadas
        horasOcupadas.forEach(h => {
          const opt = Array.from(selectHora.options).find(o => o.value === h);
          if (opt) opt.disabled = true;
        });
      });
  }

  inputFecha.addEventListener('change', bloquearHoras);
  selectBarbero.addEventListener('change', bloquearHoras);

  // ====== ENVÍO DE FORMULARIO (opcional AJAX) ======
  const formCita = document.getElementById("form-cita");
  formCita.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(formCita);
    fetch("php/agendar_cita.php", {
      method: "POST",
      body: data,
      credentials: "same-origin" 
    })
    .then(res => res.text())
    .then(respuesta => {
      mensaje.textContent = respuesta;
      if (respuesta.includes("Cita registrada correctamente")) {
        bloquearHoras(); // actualizar horas ocupadas inmediatamente
        formCita.reset();
      }
    })
    .catch(err => {
      mensaje.textContent = "Error al agendar cita.";
      console.error(err);
    });
  });

});
