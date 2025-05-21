const PDFDocument = require('pdfkit');

exports.generatePurchasePDF = (user, car, sale) => {
  const doc = new PDFDocument();
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  // Número de factura
  doc.fontSize(18).text(`Factura de compra Nº: ${sale.invoiceNumber}`, { align: 'right' });
  doc.moveDown();

  // Emisor
  doc.fontSize(14).text('Emisor:', { underline: true });
  doc.text('LKS Cars S.L.');
  doc.text('CIF: B12345678');
  doc.text('C/ Ejemplo 123, Madrid, España');
  doc.text('Email: lkscars.info@gmail.com');
  doc.text('Tel: 600 123 456');
  doc.moveDown();

  // Cliente
  doc.fontSize(14).text('Cliente:', { underline: true });
  doc.text(`Nombre: ${user.name}`);
  doc.text(`Email: ${user.email}`);
  doc.moveDown();

  // Vehículo
  doc.fontSize(14).text('Vehículo:', { underline: true });
  doc.text(`Marca: ${car.brand}`);
  doc.text(`Modelo: ${car.model}`);
  doc.text(`Año: ${car.year}`);
  doc.moveDown();

  // Precios
  const precioSinIVA = (sale.price / 1.21).toFixed(2);
  const iva = (sale.price - precioSinIVA).toFixed(2);
  const total = Number(sale.price).toFixed(2);

  doc.fontSize(14).text('Resumen de la compra:', { underline: true });
  doc.text(`Precio sin IVA: ${precioSinIVA} €`);
  doc.text(`IVA (21%): ${iva} €`);
  doc.text(`Total: ${total} €`);
  doc.moveDown();

  // Fecha, ID y forma de pago
  doc.text(`Fecha de compra: ${sale.createdAt.toLocaleDateString('es-ES')}`);
  doc.text(`ID de venta: ${sale._id}`);
  doc.text('Forma de pago: Tarjeta');
  doc.moveDown();

  doc.fontSize(16).text('¡Gracias por tu compra!', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
  });
};

/* exports.generatePurchasePDF = (user, car, sale) => {
  const doc = new PDFDocument();
  let buffers = [];

  doc.on('data', buffers.push.bind(buffers));

  doc.fontSize(20).text('Factura de compra', { align: 'center' });
  doc.moveDown();
  doc.fontSize(14).text(`Cliente: ${user.name} (${user.email})`);
  doc.text(`Vehículo: ${car.brand} ${car.model} (${car.year})`);
  doc.text(`Precio: ${sale.price} €`);
  doc.text(`Fecha de compra: ${sale.createdAt.toLocaleDateString('es-ES')}`);
  doc.text(`ID de la venta: ${sale._id}`);
  doc.moveDown();
  doc.text('¡Gracias por tu compra!', { align: 'center' });

  doc.end();

  return new Promise((resolve) => {
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers);
      resolve(pdfData);
    });
  });
}; */