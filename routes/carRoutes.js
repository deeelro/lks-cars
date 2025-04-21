const express = require('express');
const carController = require('../controllers/carController');
const carRouter = express.Router();

carRouter
    .route('/')
    .get(carController.getAllCars)
    .post(carController.createCar);

carRouter
    .route('/:id')
    .get(carController.getCar)
    .patch(carController.updateCar)
    .delete(carController.deleteCar);

module.exports = carRouter;