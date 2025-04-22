const Car = require('../models/carModel');
const QueryBuilder = require('../utils/queryBuilder');
const AppError = require('../utils/appError');

// Obtengo todos los vehiculos con filtros, ordenacion, paginacion y limitacion de campos
exports.getAllCars = async (req, res) => {
    try {
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

    } catch (error) {
        next(new AppError('Error al obtener los vehículos', 500));
    }
}

// Obtengo un vehiculo por su ID
exports.getCar = async (req, res, next) => {
    try {
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
    } catch (error) {
        next(new AppError('Error al obtener el vehículo', 500));
    }
}


// Creo un nuevo vehiculo
exports.createCar = async (req, res, next) => {
    try {
        const newCar = await Car.create(req.body);

        res.status(201).json({
            status: 'success',
            message: 'Coche creado',
            data: {
                car: newCar
            }
        });
    } catch (error) {
        next(new AppError('Error al crear el vehículo', 500));
    }
}


// Actualizo un vehiculo por su ID
exports.updateCar = async (req, res, next) => {
    try {
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

    } catch (error) {
        next(new AppError('Error al actualizar el vehículo', 500));
    }
}


exports.deleteCar = async (req, res, next) => {
    try {
        const car = await Car.findByIdAndDelete(req.params.id);

        if (!car) {
            return next(new AppError('No existe ningun coche con ese ID', 404));
        }

        res.status(204).json({
            status: 'success',
            data: null
        });

    } catch (error) {
        next(new AppError('Error al eliminar el vehículo', 500));
    }
}

