const PDFDocument = require('pdfkit');

exports.generatePurchasePDF = (user, car, sale) => {
  const doc = new PDFDocument({ margin: 50 });
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  // Cabecera
  doc.fontSize(22).font('Helvetica-Bold').text('FACTURA', { align: 'center', underline: true });
  doc.moveDown(1.5);

  // Datos emisor y cliente
  doc.fontSize(12).font('Helvetica-Bold').text('Emisor:', { underline: true });
  doc.font('Helvetica').text('LKS Cars S.L.');
  doc.text('CIF: B12345678');
  doc.text('C/ Ejemplo 123, Madrid, España');
  doc.text('Email: lkscars.info@gmail.com');
  doc.text('Tel: 600 123 456');
  doc.moveUp(5).font('Helvetica-Bold').text('Cliente:', 350, doc.y, { underline: true });
  doc.font('Helvetica').text(`Nombre: ${user.name}`, 350);
  doc.text(`Email: ${user.email}`, 350);
  doc.moveDown(2);

  // Datos factura
  doc.fontSize(12).font('Helvetica-Bold').text(`Nº Factura: ${sale.invoiceNumber}`);
  const fechaFactura = sale.createdAt ? new Date(sale.createdAt) : new Date();
  doc.font('Helvetica').text(`Fecha: ${fechaFactura.toLocaleDateString('es-ES')}`);  doc.text(`ID venta: ${sale._id}`);
  doc.moveDown();

  // Tabla de conceptos
  doc.fontSize(13).font('Helvetica-Bold').text('Detalle de la operación:', { underline: true });
  doc.moveDown(0.5);

  // Cabecera tabla
  doc.text('Concepto', 50, doc.y, { continued: true });
  doc.text('Cantidad', 250, doc.y, { continued: true });
  doc.text('Precio unitario', 330, doc.y, { continued: true });
  doc.text('Subtotal', 450, doc.y);
  doc.font('Helvetica');

  // Línea separadora
  doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();

  // Fila vehículo
  const precioSinIVA = (sale.price / 1.21).toFixed(2);
  const iva = (sale.price - precioSinIVA).toFixed(2);
  const total = Number(sale.price).toFixed(2);

  doc.text(`${car.brand} ${car.model} (${car.year})`, 50, doc.y + 5, { continued: true });
  doc.text('1', 250, doc.y, { continued: true });
  doc.text(`${precioSinIVA} €`, 330, doc.y, { continued: true });
  doc.text(`${precioSinIVA} €`, 450, doc.y);

  // Totales
  doc.moveDown(2);
  doc.font('Helvetica').text(`Base imponible: ${precioSinIVA} €`, { align: 'right' });
  doc.text(`IVA (21%): ${iva} €`, { align: 'right' });
  doc.font('Helvetica-Bold').text(`TOTAL: ${total} €`, { align: 'right' });
  doc.font('Helvetica');

  doc.moveDown(2);

  // Forma de pago y nota legal
  doc.fontSize(12).text('Forma de pago: Tarjeta');
  doc.moveDown();
  doc.fontSize(10).fillColor('gray')
    .text('Esta factura acredita la compraventa del vehículo detallado. Guarde este documento como justificante de la operación.', { align: 'center' });

  doc.moveDown(2);
  doc.fontSize(14).fillColor('black').text('¡Gracias por confiar en LKS Cars!', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
  });
};