const express = require('express');
const viewsController = require('./../controllers/viewsController');
const authController = require('./../controllers/authController');
const salesController = require('./../controllers/salesController');

const router = express.Router();

router.get('/', authController.isLoggedIn, viewsController.getOverview);
router.get('/car/:id', authController.isLoggedIn, authController.protect, viewsController.getCar);
router.get('/signup', viewsController.getSignupForm);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-purchases', authController.isLoggedIn, authController.protect, viewsController.getMyPurchases);
router.get('/favorites', 
    authController.isLoggedIn, 
    authController.protect, 
    viewsController.getFavoritesView
);

// Rutas de la administracion de vehiculos
router.get('/add-car', authController.protect, authController.restrictTo('admin'), viewsController.addCar);
router.get('/manage-cars', authController.protect, authController.restrictTo('admin'), viewsController.getManageCars);

module.exports = router;
