const Car = require('./../models/carModel');
const Sale = require('./../models/saleModel');
const User = require('./../models/userModel');
const Email = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { generatePurchasePDF } = require('../utils/pdf'); 

/* exports.getOverview = catchAsync (async (req, res) => {
    
    // 1. Si viene de Stripe con parámetros de compra, marca el coche como vendido
    if (req.query.car && req.query.user && req.query.price) {
        await Car.findByIdAndUpdate(req.query.car, { sold: true });

        await Sale.create({ car: req.query.car, user: req.query.user, price: req.query.price });

        return res.redirect(req.path);
    }
    
    const cars = await Car.find();
    
    res.status(200).render('overview', {
        title: 'LKS Cars',
        cars
    })
}); */

exports.getOverview = catchAsync(async (req, res) => {
  if (req.query.car && req.query.user && req.query.price) {
    await Car.findByIdAndUpdate(req.query.car, { sold: true });

    // Generar número de factura correlativo
    const year = new Date().getFullYear();
    const lastSale = await Sale.findOne({ invoiceNumber: { $regex: `^${year}-` } })
      .sort({ createdAt: -1 })
      .select('invoiceNumber');

    let nextNumber = 1;
    if (lastSale && lastSale.invoiceNumber) {
      const last = parseInt(lastSale.invoiceNumber.split('-')[1], 10);
      nextNumber = last + 1;
    }
    const invoiceNumber = `${year}-${String(nextNumber).padStart(3, '0')}`;

    // Crear la venta con el número de factura
    const sale = await Sale.create({
      car: req.query.car,
      user: req.query.user,
      price: req.query.price,
      invoiceNumber
    });

    const user = await User.findById(req.query.user);
    const car = await Car.findById(req.query.car);

    // Genera el PDF
    const pdfBuffer = await generatePurchasePDF(user, car, sale);

    // Envía la factura con PDF adjunto
    await new Email(user, null).sendPurchaseTicket({ sale, car, user, pdfBuffer });

    return res.redirect(req.path);
  }
  const cars = await Car.find();
  res.status(200).render('overview', {
    title: 'LKS Cars',
    cars
  });
});

exports.getCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id).populate({
        path: 'reservedBy',
        select: 'id name email'
    });

    if (!car) {
        return next(new AppError('No se encontró el coche con ese ID', 404));
    }

    // Verifica si el usuario actual es el que reservó el coche
    const isReservedByCurrentUser = car.reservedBy && req.user && car.reservedBy._id.toString() === req.user.id;

    res.status(200).render('car', {
        title: `${car.brand} ${car.model}`,
        car,
        isReservedByCurrentUser // Pasa esta información a la vista
    });
});


exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Regístrate'
  });
};


exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
}

exports.getAccount = (req, res) => {
    console.log(req.user); // Se imprime el usuario en la consola
    res.status(200).render('account', {
        title: 'Your account',
        user: req.user // Se pasa el usuario a la vista
    });
}


exports.addCar = (req, res) => {
    res.status(200).render('addCar', {
        title: 'Añadir vehiculo',
        user: req.user // Se pasa el usuario a la vista
    });
}



exports.getManageCars = catchAsync(async (req, res, next) => {
    const cars = await Car.find().populate({
        path: 'reservedBy',
        select: 'name email'
    })

    res.status(200).render('manageCars', {
        title: 'Administrar Vehículos',
        cars, // Pasa los vehículos a la vista
        user: req.user // Pasa el usuario a la vista
    });
});

exports.getMyPurchases = catchAsync(async (req, res) => {
    const purchases = await Sale.find({ user: req.user.id }).select('+createdAt');

    res.status(200).render('myPurchases', {
        title: 'Mis compras',
        purchases
    });
});


exports.getFavoritesView = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
        path: 'favorites',
        select: 'brand model year price coverImage'
    });

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    res.status(200).render('favorites', {
        title: 'Tus favoritos',
        favorites: user.favorites
    });
});