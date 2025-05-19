const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');

const router = express.Router();

// RUTAS PUBLICAS
router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);
router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

// RUTAS PROTEGIDAS PARA USUARIOS REGISTRADOS
router.use(authController.protect); // el usuario tiene que estar autenticado para acceder a las siguientes rutas

router.patch('/updateMyPassword', authController.updatePassword);
router.get('/me', userController.getMe, userController.getUser);
router.patch('/updateMe', userController.uploadUserPhoto, userController.resizeUserPhoto, userController.updateMe);
router.delete('/deleteMe', userController.deleteMe);
router.get('/favorites', userController.getFavorites);
router.patch('/removeFavorite/:carId', userController.removeFavorite);
router.patch('/addFavorite/:carId', userController.addFavorite);

// RUTAS DE ADMINISTRACION (PROTEGIDAS Y RESTRINGIDAS A ADMINISTRADORES)
router.use(authController.restrictTo('admin'));

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
