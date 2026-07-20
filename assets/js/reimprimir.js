import CONFIG from "./config.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "index.html";

const numeroInput = document.getElementById("numero-boleto-reimpresion");
const buscarBtn = document.getElementById("buscar-boleto-btn");
const volverBtn = document.getElementById("volver-rifas-btn");
const estadoDiv = document.getElementById("estado-reimpresion");
const textoBuscarOriginal = buscarBtn.textContent.trim();

function mostrarEstado(mensaje, tipo = "info") {
  estadoDiv.textContent = mensaje;
  estadoDiv.className = `alert alert-${tipo}`;
  estadoDiv.classList.remove("d-none");
}

function cambiarEstadoBusqueda(busquedaActiva) {
  buscarBtn.disabled = busquedaActiva;
  buscarBtn.setAttribute("aria-busy", String(busquedaActiva));

  if (busquedaActiva) {
    buscarBtn.innerHTML = `
      <span class="spinner-border spinner-border-sm mr-2" role="status" aria-hidden="true"></span>
      Buscando boleto...
    `;
  } else {
    buscarBtn.textContent = textoBuscarOriginal;
  }
}

numeroInput.addEventListener("input", () => {
  numeroInput.value = numeroInput.value.replace(/\D/g, "");
});

function buscarBoletoVendido(numero) {
  const request = new XMLHttpRequest();
  request.open(
    "GET",
    CONFIG.apiUrl(`api/boleto-vendido?numero=${encodeURIComponent(numero)}`),
    false
  );

  try {
    request.send();
  } catch (error) {
    console.error("Error al buscar boleto vendido:", error);
    return { ok: false, mensaje: "No se pudo buscar el boleto." };
  }

  let data = {};
  try {
    data = request.responseText ? JSON.parse(request.responseText) : {};
  } catch (error) {
    return { ok: false, mensaje: "No se pudo buscar el boleto." };
  }

  if (request.status === 404 || !data.vendido) {
    return { ok: false, mensaje: "A\u00fan no se ha vendido ese boleto." };
  }

  if (request.status < 200 || request.status >= 300) {
    return { ok: false, mensaje: "No se pudo buscar el boleto." };
  }

  return { ok: true, boleto: data.boleto };
}

function procesarBusqueda(numero) {
  let resultado;
  try {
    resultado = buscarBoletoVendido(numero);
  } finally {
    cambiarEstadoBusqueda(false);
  }

  if (!resultado.ok) {
    mostrarEstado(resultado.mensaje, "warning");
    return;
  }

  sessionStorage.setItem("reimpresionBoleto", JSON.stringify(resultado.boleto));
  const ventana = window.open(`recibo.html?numero=${encodeURIComponent(numero)}`, "_blank");

  if (!ventana) {
    mostrarEstado("El navegador bloque\u00f3 la ventana del boleto.", "warning");
  } else {
    estadoDiv.classList.add("d-none");
  }
}

buscarBtn.addEventListener("click", () => {
  const numero = numeroInput.value.trim();

  if (!numero) {
    mostrarEstado("Ingrese el numero de boleto.", "warning");
    return;
  }

  cambiarEstadoBusqueda(true);
  mostrarEstado("Buscando boleto...", "info");

  // Permite que el navegador pinte el estado de carga antes de consultar.
  requestAnimationFrame(() => {
    requestAnimationFrame(() => procesarBusqueda(numero));
  });
});

volverBtn.addEventListener("click", () => {
  window.location.href = "/rifa.html";
});
