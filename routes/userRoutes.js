const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// Rutas de autenticación
router.post('/signup', authController.signup);
router.post('/login', authController.login);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

router.patch(
  '/updateMyPassword',
  authController.protect,
  authController.updatePassword
);

router.patch('/updateMe', authController.protect, userController.updateMe);
router.delete('/deleteMe', authController.protect, userController.deleteMe);

// Añado lo siguiente para que el middleware de protección y el de restricción de acceso se apliquen a todas las rutas siguientes
// (es decir, a las rutas de administración)
router.use(authController.protect); // el usuario tiene que estar autenticado para acceder a las siguientes rutas
router.use(authController.restrictTo('admin')); // ademas debe ser admin

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);

module.exports = router;
