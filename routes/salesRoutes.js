const express = require('express');
const salesController = require('./../controllers/salesController');
const authController = require('./../controllers/authController');

const router = express.Router();

router.get(
    '/checkout-session/:carId', 
    authController.protect, 
    salesController.checkoutSession
);

module.exports = router;