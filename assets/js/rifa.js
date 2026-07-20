import CONFIG from "./config.js";


const celularInput = document.getElementById("celular");
// Validación de sesión
const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "login.html";

// Mostrar nombre del usuario
document.getElementById("user-email").textContent = user.nombre;

const verificarBtn = document.getElementById("verificar-btn");
const registrarBtn = document.getElementById("registrar-btn");
const estadoDiv = document.getElementById("estado-boleto");

let disponible = false;

// Verificar si el boleto está disponible
verificarBtn.addEventListener("click", async () => {
  const numero = document.getElementById("numero-boleto").value;
  if (!numero) return alert("Ingrese un número de boleto");

  try {
    const res = await fetch(CONFIG.apiUrl(`api/verificar-boleto?numero=${numero}`));
    const data = await res.json();

    if (data.disponible) {
      estadoDiv.textContent = "✅ Disponible";
      estadoDiv.className = "alert alert-success";
      disponible = true;
    } else {
      estadoDiv.textContent = "❌ Ya fue comprado";
      estadoDiv.className = "alert alert-danger";
      disponible = false;
    }

    estadoDiv.classList.remove("d-none");
  } catch (err) {
    console.error("❌ Error al verificar:", err);
    alert("Error al verificar boleto");
  }
});

// Registrar boleto
registrarBtn.addEventListener("click", async () => {
  if (!disponible) return alert("El número no está disponible");

  const numero = document.getElementById("numero-boleto").value;
  const nombres = document.getElementById("nombres").value;
  const celular = document.getElementById("celular").value;
  const direccion = document.getElementById("direccion").value;

  if (!numero || !nombres || !celular || !direccion) {
    return alert("Complete todos los campos");
  }

  try {
    const res = await fetch(CONFIG.apiUrl("api/registrar-boleto"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        numero,
        nombres,
        celular,
        direccion,
        vendedor: user.nombre
      })
    });

    const result = await res.json();
    if (result.mensaje) {
      const fechaHoy = new Date().toLocaleString("es-EC", { timeZone: "America/Guayaquil" });

      // Guardar datos para pantalla de recibo
      localStorage.setItem("reciboRifa", JSON.stringify({
        numero,
        nombres,
        celular,
        direccion,
        vendedor: user.nombre,
        fecha: fechaHoy
      }));

      // Redirigir a recibo
      window.open("recibo.html", "_blank");
    } else {
      alert("❌ " + (result.error || "Error desconocido"));
    }
  } catch (error) {
    console.error("❌ Error al registrar:", error);
    alert("Error al registrar boleto");
  }
});

// Botón para limpiar manualmente los campos
document.getElementById("limpiar-btn").addEventListener("click", () => {
  document.getElementById("numero-boleto").value = "";
  document.getElementById("nombres").value = "";
  document.getElementById("celular").value = "";
  document.getElementById("direccion").value = "";
  estadoDiv.classList.add("d-none");
  disponible = false;
});

document.getElementById("reimprimir-btn").addEventListener("click", () => {
  window.location.href = "reimprimir.html";
});

// Botón para obtener número aleatorio disponible
document.getElementById("btn-aleatorio").addEventListener("click", async () => {
  try {
    const res = await fetch(CONFIG.apiUrl("api/boletos-disponibles"));
    const data = await res.json();

    if (!data.disponibles || data.disponibles.length === 0) {
      return alert("🎟️ No hay boletos disponibles");
    }

    const aleatorio = data.disponibles[Math.floor(Math.random() * data.disponibles.length)];

    document.getElementById("numero-boleto").value = aleatorio;

    // Simula que se presionó el botón "verificar"
    verificarBtn.click();
  } catch (error) {
    console.error("❌ Error al obtener número aleatorio:", error);
    alert("Error al obtener número aleatorio");
  }
});


// VALIDACIÓN DE NÚMERO DE CELULAR



// Función para validar número celular ecuatoriano
function validarCelular(valor) {
  const regex = /^0\d{9}$/; // Empieza con 0 + 9 dígitos más
  return regex.test(valor);
}

// Verifica en tiempo real si el número es válido
celularInput.addEventListener("input", () => {
  const esValido = validarCelular(celularInput.value);
  registrarBtn.disabled = !esValido;

  if (!esValido && celularInput.value.length > 0) {
    celularInput.classList.add("is-invalid");
  } else {
    celularInput.classList.remove("is-invalid");
  }
});


// Cerrar sesión
document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});
