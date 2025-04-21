const Car = require('../models/carModel');
const AppError = require('../utils/appError');

exports.getAllCars = async (req, res) => {
    try {
        const cars = await Car.find(); // Busco todos los coches
        res.status(200).json(cars);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}


exports.getCar = async (req, res, next) => {
    try {
        const car = await Car.findById(req.params.id); // Busco el coche por ID

        if (!car) {
            return next(new AppError('No existe ningun coche con ese ID', 404));
        }
        res.status(200).json(car);
    } catch (error) {
        res.status(500).json({message: error.message});
    }
}



exports.createCar = async (req, res) => {
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
        res.status(500).json({message: error.message});
    }
}


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
        res.status(500).json({message: error.message});
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
        res.status(500).json({message: error.message});
    }
}

