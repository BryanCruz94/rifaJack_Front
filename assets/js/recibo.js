import CONFIG from "./config.js";

const params = new URLSearchParams(window.location.search);
const numeroReimpresion = params.get("numero");
const reciboBox = document.querySelector(".recibo-box");
const registrarLink = document.querySelector(".btn-registrar");

function pintarRecibo(data) {
  document.getElementById("numero-boleto").textContent = `BOLETO N.º ${data.numero}`;
  document.getElementById("nombres").textContent = data.nombres;
  document.getElementById("celular").textContent = data.celular;
  document.getElementById("direccion").textContent = data.direccion;
  document.getElementById("vendedor").textContent = data.vendedor;
  document.getElementById("fecha").textContent = data.fecha;
}

function mostrarMensajeNoVendido(mensaje) {
  reciboBox.innerHTML = `
    <div class="contenido">
      <div class="alert alert-warning mb-0 text-center">
        ${mensaje}
      </div>
    </div>
  `;
  registrarLink.textContent = "Volver a rifas";
  registrarLink.href = "/rifa.html";
}

async function cargarBoletoVendido(numero) {
  const boletoGuardado = JSON.parse(sessionStorage.getItem("reimpresionBoleto") || "null");

  if (boletoGuardado && String(boletoGuardado.numero) === String(numero)) {
    sessionStorage.removeItem("reimpresionBoleto");
    pintarRecibo(boletoGuardado);
    return;
  }

  document.getElementById("numero-boleto").textContent = `BOLETO N.º ${numero}`;
  document.getElementById("nombres").textContent = "Buscando boleto...";

  try {
    const res = await fetch(CONFIG.apiUrl(`api/boleto-vendido?numero=${encodeURIComponent(numero)}`));
    const data = await res.json();

    if (!res.ok || !data.vendido) {
      mostrarMensajeNoVendido(data.error || "A\u00fan no se ha vendido ese boleto.");
      return;
    }

    pintarRecibo(data.boleto);
  } catch (error) {
    console.error("Error al cargar boleto vendido:", error);
    mostrarMensajeNoVendido("No se pudo buscar el boleto.");
  }
}

if (numeroReimpresion) {
  cargarBoletoVendido(numeroReimpresion);
} else {
  const data = JSON.parse(localStorage.getItem("reciboRifa"));
  if (!data) window.location.href = "rifa.html";

  pintarRecibo(data);
}
