document.addEventListener("DOMContentLoaded", () => {
  const fechaInput = document.getElementById("fecha");
  const horaSelect = document.getElementById("hora");
  const form = document.getElementById("form-cita");
  const mensaje = document.getElementById("mensaje");

  // 🔹 Establecer fecha mínima (no se puede elegir un día anterior al actual)
  const hoy = new Date();
  const año = hoy.getFullYear();
  const mes = String(hoy.getMonth() + 1).padStart(2, "0");
  const dia = String(hoy.getDate()).padStart(2, "0");
  const fechaMinima = `${año}-${mes}-${dia}`;
  fechaInput.setAttribute("min", fechaMinima);

  // 🔹 Evento al cambiar la fecha
  fechaInput.addEventListener("change", () => {
    const fechaSeleccionada = new Date(fechaInput.value + "T00:00:00");
    const diaSemana = fechaSeleccionada.getUTCDay(); // 0 = Domingo

    // Bloquear domingos
    if (diaSemana === 0) {
      mensaje.textContent = "⛔ Los domingos no se realizan citas. Por favor elige otro día.";
      mensaje.classList.add("text-danger");
      fechaInput.value = "";
      horaSelect.innerHTML = "";
      return;
    }

    mensaje.textContent = "";
    generarHoras(fechaInput.value);
  });

  // 🔹 Generar horarios disponibles de 10:00 a 18:00 cada 20 min
  function generarHoras(fechaSeleccionada) {
    horaSelect.innerHTML = "";
    const inicio = 10 * 60; // 10:00 AM
    const fin = 18 * 60;    // 6:00 PM
    const citasGuardadas = JSON.parse(localStorage.getItem("citas")) || [];

    for (let minutos = inicio; minutos < fin; minutos += 20) {
      const horas = Math.floor(minutos / 60);
      const mins = minutos % 60;
      const horaFormateada = `${String(horas).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;

      // Verificar si esa hora ya está ocupada para la fecha seleccionada
      const ocupada = citasGuardadas.some(
        c => c.fecha === fechaSeleccionada && c.hora === horaFormateada
      );

      if (!ocupada) {
        const option = document.createElement("option");
        option.value = horaFormateada;
        option.textContent = horaFormateada;
        horaSelect.appendChild(option);
      }
    }

    // Si todas las horas están ocupadas
    if (horaSelect.options.length === 0) {
      const option = document.createElement("option");
      option.textContent = "No hay horarios disponibles";
      option.disabled = true;
      horaSelect.appendChild(option);
    }
  }

  // 🔹 Guardar cita (simulada con localStorage)
  form.addEventListener("submit", e => {
    e.preventDefault();

    const nombre = document.getElementById("nombre").value.trim();
    const fecha = fechaInput.value;
    const hora = horaSelect.value;

    if (!nombre || !fecha || !hora) {
      mensaje.textContent = "⚠️ Por favor completa todos los campos.";
      mensaje.classList.add("text-warning");
      return;
    }

    // Evitar duplicar la misma hora/fecha
    let citas = JSON.parse(localStorage.getItem("citas")) || [];
    const existe = citas.some(c => c.fecha === fecha && c.hora === hora);

    if (existe) {
      mensaje.textContent = "⛔ Esa hora ya está reservada. Elige otra.";
      mensaje.classList.add("text-danger");
      return;
    }

    const cita = { nombre, fecha, hora };
    citas.push(cita);
    localStorage.setItem("citas", JSON.stringify(citas));

    mensaje.textContent = `✅ Cita agendada para ${fecha} a las ${hora}. ¡Te esperamos, ${nombre}!`;
    mensaje.classList.remove("text-danger", "text-warning");
    mensaje.classList.add("text-success");

    form.reset();
    horaSelect.innerHTML = "";
  });
});
