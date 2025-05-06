const Car = require('./../models/carModel');
const catchAsync = require('./../utils/catchAsync');

exports.getOverview = catchAsync (async (req, res) => {
    const cars = await Car.find();
    
    res.status(200).render('overview', {
        title: 'All cars',
        cars
    })
});

exports.getCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id); // Busca el coche por ID

    if (!car) {
        return next(new AppError('No se encontró el coche con ese ID', 404));
    }

    res.status(200).render('car', {
        title: `${car.brand} ${car.model}`,
        car
    });
});


