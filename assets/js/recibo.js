const data = JSON.parse(localStorage.getItem("reciboRifa"));
if (!data) window.location.href = "rifa.html"; // Evita acceso directo sin datos

document.getElementById("numero-boleto").textContent = `BOLETO N.º ${data.numero}`;
document.getElementById("nombres").textContent = data.nombres;
document.getElementById("celular").textContent = data.celular;
document.getElementById("direccion").textContent = data.direccion;
document.getElementById("vendedor").textContent = data.vendedor;
document.getElementById("fecha").textContent = data.fecha;
