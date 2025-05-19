const multer = require('multer');
const sharp = require('sharp');
const User = require('./../models/userModel');
const Car = require('./../models/carModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./controllerFactory');

const multerStorage = multer.memoryStorage(); // Almacena la imagen en memoria

// Compruebo si el archivo es una imagen
const multerFilter = (req, file, cb) => {
  // 1) Check if the file is an image
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new AppError('Por favor, sube una imagen valida', 400), false);
  }
};

// Configuro la subida de archivos
const upload = multer({ 
  storage: multerStorage,
  fileFilter: multerFilter 
});

exports.uploadUserPhoto = upload.single('photo');


exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) {
    return next(); // Si no hay foto, paso al siguiente middleware
  }

  // guardo en el cuerpo de la peticion el nuevo nombre de la imagen
  req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`; 

  await sharp(req.file.buffer) // redimensiono la imagen 
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({ quality: 90 })
    .toFile(`public/img/users/${req.file.filename}`); // guardo la imagen en el servidor
    next();
});


// Filtra el body para solo actualizar SOLO los campos permitidos
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach(el => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};


// Reemplaza el id de la peticion por el id del usuario logueado
// lo usare para obtener los datos del usuario logueado (perfil)
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;  
  next(); 
}


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
  if (req.file) filteredBody.photo = req.file.filename; // Si hay una foto, la añado al objeto

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


exports.getFavorites = catchAsync(async (req, res, next) => {
    // Obtén el usuario logueado y popula los favoritos
    const user = await User.findById(req.user.id).populate({
        path: 'favorites',
        select: 'brand model year price coverImage'
    });

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    res.status(200).render('favorites', {
        title: 'Tus favoritos',
        favorites: user.favorites // Pasa los coches favoritos a la vista
    });
});

exports.removeFavorite = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $pull: { favorites: req.params.carId } }, // Elimina el coche de favoritos
        { new: true }
    );

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});

exports.addFavorite = catchAsync(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(
        req.user.id,
        { $addToSet: { favorites: req.params.carId } }, // Añade el coche a favoritos si no está ya
        { new: true }
    );

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    res.status(200).json({
        status: 'success',
        data: null
    });
});


///////////////////////////////////
///// RUTAS DE ADMINISTRACION /////
//////////////////////////////////
exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User); 
exports.updateUser = factory.updateOne(User);
exports.deleteUser = factory.deleteOne(User);

exports.createUser = (req, res) => {
  res.status(500).json({
    status: 'error',
    message: 'Para crear un usuario, hazlo desde el formulario de registro'
  });
};


/* 
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
 */