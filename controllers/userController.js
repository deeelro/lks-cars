const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');


// Filtra el body para solo actualizar SOLO los campos permitidos
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


// Actualiza los campos de un usuario pasados por el body de la peticion
exports.updateMe = catchAsync(async (req, res, next) => {
  // Error si se intenta actualizar la contraseña desde esta ruta
  if (req.body.password || req.body.passwordConfirm) {
    return next(
      new AppError(
        'Aquí no se actualiza la contraseña. Usa /updateMyPassword.',
        400
      )
    );
  }

  // Guardo en la constante el body filtrado para solo poder actualizar nombre y email
  const filteredBody = filterObj(req.body, 'name', 'email');

  // Buscar el usuario por su ID y actualizarlo
  const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
    new: true,
    runValidators: true
  });

  res.status(200).json({
    status: 'success',
    data: {
      user: updatedUser
    }
  });
});


// Elimina el usuario de la base de datos (no lo borra, lo marca como inactivo)
exports.deleteMe = catchAsync(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user.id, { active: false });

  res.status(204).json({
    status: 'success',
    data: null
  });
});


///////////////////////////////////
///// RUTAS DE ADMINISTRACION /////
//////////////////////////////////
// Busca todos los campos de la coleccion de usuarios
exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find();

  // SEND RESPONSE
  res.status(200).json({
    status: 'success',
    results: users.length,
    data: {
      users
    }
  });
});

exports.getUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.updateUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
exports.deleteUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'This route is not yet defined!'
  });
};
