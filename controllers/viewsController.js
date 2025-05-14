const Car = require('./../models/carModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.getOverview = catchAsync (async (req, res) => {
    const cars = await Car.find();
    
    res.status(200).render('overview', {
        title: 'LKS Cars',
        cars
    })
});

exports.getCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id); // Busca el coche por ID

    // Si no existe el vehiculo, lanza un error
    if (!car) {
        return next(new AppError('No se encontró el coche con ese ID', 404));
    }
    
    res.status(200).render('car', {
        title: `${car.brand} ${car.model}`,
        car
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
