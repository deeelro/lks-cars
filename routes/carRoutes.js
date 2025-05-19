const express = require('express');
const carController = require('../controllers/carController');
const authController = require('../controllers/authController');
const carRouter = express.Router();

carRouter
    .route('/')
    .get(carController.getAllCars)
    .post(
        authController.protect,
        authController.restrictTo('admin'),
        carController.uploadCarImages,
        carController.resizeCarImages,
        carController.createCar
    );

carRouter
    .route('/:id')
    .get(carController.getCar)
    .patch(
        authController.protect,
        authController.restrictTo('admin'),
        carController.uploadCarImages,
        carController.resizeCarImages,
        carController.updateCar)
    .delete(
        authController.protect,
        authController.restrictTo('admin'),
        carController.deleteCar
    );

/* carRouter
    .patch('/:id/reserve', authController.protect, carController.reserveCar);

carRouter
    .patch('/:id/unreserve', authController.protect, carController.unreserveCar);
 */
module.exports = carRouter;