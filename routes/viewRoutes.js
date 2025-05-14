const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/car/:id', authController.isLoggedIn, authController.protect, viewsController.getCar);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);

// Ruta para añadir vehiculos
router.get('/add-car', authController.protect, authController.restrictTo('admin'), viewsController.addCar);

module.exports = router;
