const { generatePurchasePDF } = require('../utils/pdf');
const Car = require('./../models/carModel');
const catchAsync = require('./../utils/catchAsync');
const Sale = require('./../models/saleModel');
const User = require('./../models/userModel');
const factory = require('./controllerFactory');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);


exports.downloadInvoice = async (req, res, next) => {
  const sale = await Sale.findById(req.params.saleId).populate('car user');
  if (!sale) return res.status(404).send('Factura no encontrada');

  const pdfBuffer = await generatePurchasePDF(sale.user, sale.car, sale);

  res.set({
    'Content-Type': 'application/pdf',
    'Content-Disposition': `attachment; filename="factura-${sale.invoiceNumber}.pdf"`
  });
  res.send(pdfBuffer);
};

exports.checkoutSession = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.carId);
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        success_url: `${req.protocol}://${req.get('host')}/?car=${req.params.carId}&user=${req.user._id}&price=${car.price}`,
        cancel_url: `${req.protocol}://${req.get('host')}/car/${req.params.carId}`,
        customer_email: req.user.email,
        client_reference_id: req.params.carId,
        line_items: [{
            price_data: {
                currency: 'usd',
                product_data: {
                    name: `${car.brand} ${car.model}`,
                    description: car.description,
                    images: [`${req.protocol}://${req.get('host')}/img/cars/${car.coverImage}`],
                },
                unit_amount: car.price * 100, // El precio debe estar en centavos
            },
            quantity: 1,
        }]
    });
    res.status(200).json({
        status: 'success',
        session
    });
});

exports.createSalesCheckout = catchAsync(async (req, res, next) => {
    const { car, user, price } = req.query;

    if (!car || !user || !price) return next();

    await Sale.create({ car, user, price });

    res.redirect(req.originalUrl.split('?')[0]);
});

exports.createSale = factory.createOne(Sale);
exports.getSale = factory.getOne(Sale);
exports.updateSale = factory.updateOne(Sale);
exports.deleteSale = factory.deleteOne(Sale);
exports.getAllSales = factory.getAll(Sale);
