import CONFIG from "./config.js";

const user = JSON.parse(localStorage.getItem("user"));
if (!user) window.location.href = "index.html";

document.getElementById("user-email").textContent = user.nombre;

const nombreRifaInput = document.getElementById("nombre-rifa");
const imprimirBtn = document.getElementById("imprimir-boletos-btn");
const estadoDiv = document.getElementById("estado-sorteo");

function mostrarEstado(mensaje, tipo = "info") {
  estadoDiv.textContent = mensaje;
  estadoDiv.className = `alert alert-${tipo}`;
  estadoDiv.classList.remove("d-none");
}

function limpiarNombreArchivo(valor) {
  return valor
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9-_ ]/g, "")
    .trim()
    .replace(/\s+/g, "_")
    .toLowerCase();
}

function escribirTexto(doc, texto, x, y, maxWidth, lineHeight, maxLines) {
  const lineas = doc.splitTextToSize(String(texto || ""), maxWidth).slice(0, maxLines);
  lineas.forEach((linea, index) => {
    doc.text(linea, x, y + (index * lineHeight));
  });
}

function dibujarBoleto(doc, boleto, titulo, x, y, width, height) {
  const padding = 3.2;
  const textX = x + padding;
  const contentWidth = width - (padding * 2);
  const tituloLinea = doc.splitTextToSize(titulo, contentWidth).slice(0, 1)[0];

  doc.setFillColor(237, 246, 243);
  doc.rect(x, y, width, 6.4, "F");
  doc.setFillColor(56, 132, 107);
  doc.rect(x, y, 1.1, height, "F");

  doc.setDrawColor(83, 98, 94);
  doc.setLineWidth(0.22);
  doc.rect(x, y, width, height);

  doc.setTextColor(31, 82, 67);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(8.2);
  doc.text(tituloLinea, x + (width / 2), y + 4.1, { align: "center" });

  doc.setDrawColor(137, 170, 158);
  doc.setLineWidth(0.12);
  doc.line(textX, y + 6.4, x + width - padding, y + 6.4);

  doc.setFillColor(221, 237, 231);
  doc.roundedRect(textX, y + 8, 23, 3.8, 0.8, 0.8, "F");
  doc.setTextColor(184, 48, 48);
  doc.setFontSize(7.2);
  doc.text(`BOLETO #${boleto.numero}`, textX + 1.5, y + 10.6);

  doc.setTextColor(104, 111, 108);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(5.3);
  doc.text("COMPRADOR", textX, y + 14.2);

  doc.setTextColor(35, 49, 45);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(7.8);
  escribirTexto(doc, boleto.comprador, textX, y + 17.3, contentWidth, 3, 1);

  doc.setTextColor(75, 83, 80);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(7.8);
  escribirTexto(doc, `Tel.: ${boleto.telefono}`, textX, y + 21.5, contentWidth, 2.7, 1);
  doc.setFontSize(5.9);
  escribirTexto(doc, `Direccion: ${boleto.direccion}`, textX, y + 24.3, contentWidth, 2.7, 1);
}

function dibujarGuiasCorte(doc, marginX, marginY, ticketWidth, ticketHeight, gapX, gapY, columns, rows) {
  const gridWidth = (ticketWidth * columns) + (gapX * (columns - 1));
  const gridHeight = (ticketHeight * rows) + (gapY * (rows - 1));
  const left = marginX - (gapX / 2);
  const top = marginY - (gapY / 2);
  const right = marginX + gridWidth + (gapX / 2);
  const bottom = marginY + gridHeight + (gapY / 2);

  doc.setDrawColor(112, 112, 112);
  doc.setLineWidth(0.18);
  doc.setLineDashPattern([1.6, 1.2], 0);
  doc.rect(left, top, right - left, bottom - top);

  for (let column = 1; column < columns; column += 1) {
    const x = marginX + (column * ticketWidth) + ((column - 0.5) * gapX);
    doc.line(x, top, x, bottom);
  }

  for (let row = 1; row < rows; row += 1) {
    const y = marginY + (row * ticketHeight) + ((row - 0.5) * gapY);
    doc.line(left, y, right, y);
  }

  doc.setLineDashPattern([], 0);
}

function generarPdfBoletos(boletos, titulo) {
  const { jsPDF } = window.jspdf;
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageWidth = 210;
  const pageHeight = 297;
  const columns = 3;
  const rows = 10;
  const perPage = columns * rows;
  const marginX = 6;
  const marginY = 6;
  const gapX = 2.4;
  const gapY = 2.4;
  const ticketWidth = (pageWidth - (marginX * 2) - (gapX * (columns - 1))) / columns;
  const ticketHeight = (pageHeight - (marginY * 2) - (gapY * (rows - 1))) / rows;

  boletos.forEach((boleto, index) => {
    if (index > 0 && index % perPage === 0) {
      doc.addPage("a4", "portrait");
    }

    if (index % perPage === 0) {
      dibujarGuiasCorte(doc, marginX, marginY, ticketWidth, ticketHeight, gapX, gapY, columns, rows);
    }

    const pageIndex = index % perPage;
    const column = pageIndex % columns;
    const row = Math.floor(pageIndex / columns);
    const x = marginX + column * (ticketWidth + gapX);
    const y = marginY + row * (ticketHeight + gapY);

    dibujarBoleto(doc, boleto, titulo, x, y, ticketWidth, ticketHeight);
  });

  const archivo = limpiarNombreArchivo(titulo) || "rifa";
  doc.save(`boletos_comprados_${archivo}.pdf`);
}

imprimirBtn.addEventListener("click", async () => {
  const titulo = nombreRifaInput.value.trim();
  if (!titulo) return alert("Ingrese el nombre de la Rifa");

  imprimirBtn.disabled = true;
  mostrarEstado("Generando PDF de boletos comprados...", "info");

  try {
    const res = await fetch(CONFIG.apiUrl("api/boletos-vendidos"));
    const contentType = res.headers.get("content-type") || "";
    let data = {};

    if (contentType.includes("application/json")) {
      data = await res.json();
    }

    if (!res.ok) {
      throw new Error(data.error || `El servidor respondió con HTTP ${res.status}`);
    }

    if (!data.boletos || data.boletos.length === 0) {
      mostrarEstado("No hay boletos comprados para imprimir.", "warning");
      return;
    }

    generarPdfBoletos(data.boletos, titulo);
    mostrarEstado(`PDF generado con ${data.boletos.length} boletos comprados.`, "success");
  } catch (error) {
    console.error("Error al imprimir boletos comprados:", error);
    mostrarEstado("No se pudo generar el PDF de boletos comprados.", "danger");
  } finally {
    imprimirBtn.disabled = false;
  }
});

document.getElementById("logout-btn").addEventListener("click", () => {
  localStorage.removeItem("user");
  window.location.href = "index.html";
});
