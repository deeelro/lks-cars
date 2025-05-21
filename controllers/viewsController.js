const Car = require('./../models/carModel');
const Sale = require('./../models/saleModel');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync (async (req, res) => {
    
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
