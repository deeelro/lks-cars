const Car = require('../models/carModel');
const QueryBuilder = require('../utils/queryBuilder');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

// Obtengo todos los vehiculos con filtros, ordenacion, paginacion y limitacion de campos
exports.getAllCars = catchAsync(async (req, res) => {
    const queryBuilder = new QueryBuilder(Car.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate(5);

    const cars = await queryBuilder.query; // Busco todos los coches

    res.status(200).json({
        status: 'success',
        results: cars.length,
        data: {
            cars
        }
    });
});

// Obtengo un vehiculo por su ID
exports.getCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id); // Busco el coche por ID

    if (!car) {
        return next(new AppError('No existe ningun coche con ese ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            car
        }
    });
});


// Creo un nuevo vehiculo
exports.createCar = catchAsync(async (req, res, next) => {
    const newCar = await Car.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Coche creado',
        data: {
            car: newCar
        }
    });
});


// Actualizo un vehiculo por su ID
exports.updateCar = catchAsync(async (req, res, next) => {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!car) {
        return next(new AppError('No existe ningun coche con ese ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            car
        }
    });
});


exports.deleteCar = catchAsync(async (req, res, next) => {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
        return next(new AppError('No existe ningun coche con ese ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
});

