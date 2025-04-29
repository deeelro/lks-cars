const crypto = require('crypto');
const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('./../models/userModel');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const sendEmail = require('./../utils/email');

// Firma el token JWT
const signToken = id => {
    const expiresIn = process.env.JWT_EXPIRES_IN; // Obtiene el valor de expiresIn desde el entorno

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: expiresIn // Usamos el valor obtenido del entorno
    });
};


// Crea y envía el token al cliente
const createSendToken = (user, statusCode, res) => {
  // Genera el token JWT usando el ID del usuario
  const token = signToken(user._id); 

  // Establece las opciones de la cookie:
  // - expires: la fecha de expiración del token
  // - httpOnly: la cookie no es accesible desde JavaScript del lado del cliente
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true // la cookie no es accesible desde JavaScript del lado del cliente (protege contra XSS)
  };

  // Si el entorno es de producción, establece la opción secure en true
  // para que la cookie solo se envíe a través de HTTPS
  if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

  // Envia la cookie con el token en la respuesta al cliente
  res.cookie('jwt', token, cookieOptions); 

  // Elimina la contraseña del objeto usuario antes de enviarlo al cliente
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: {
      user
    }
  });
};

// REGISTRO DE USUARIO
exports.signup = catchAsync(async (req, res, next) => {
  const newUser = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    passwordConfirm: req.body.passwordConfirm
    // ,role: req.body.role
  });

  createSendToken(newUser, 201, res);
});


// INICIO DE SESION
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  // Verifica si hay email y contraseña en el body de la petición
  // Si no hay, salta un error
  if (!email || !password) {
    return next(new AppError('Introduce el email y la contraseña', 400));
  }

  // Comprueba si el usuario existe y si la contraseña es correcta
  const user = await User.findOne({ email }).select('+password');

  // Si no existe el usuario o la contraseña es incorrecta, salta un error
  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Email o contraseña incorrecta', 401));
  }

  // Si todo es correcto, enviar el token al cliente
  createSendToken(user, 200, res);
});


// PROTEGE RUTAS
exports.protect = catchAsync(async (req, res, next) => {
  // Revisa si hay token en cabecera Authorization: Bearer <token>
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // Si no hay, significa que no está autenticado
  if (!token) {
    return next(
      new AppError('Inicie sesión para acceder', 401)
    );
  }

  // Verifica que el token sea válido
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  // Verifica si el usuario existe
  const currentUser = await User.findById(decoded.id);
  if (!currentUser) {
    return next(
      new AppError(
        'El usuario al que corresponde el token ya no existe',
        401
      )
    );
  }

  // Verifica si el usuario cambió la contraseña después de que se emitió el token
  // Esto es importante para la seguridad, ya que si el usuario cambia su contraseña,
  // el token anterior ya no debería ser válido
  if (currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
      new AppError('Se ha cambiado la contraseña hace poco. Inicie sesion de nuevo', 401)
    );
  }

  // Si todo es correcto, asigna el usuario actual a la request
  req.user = currentUser;
  next();
});


// RESTRICCION DE ACCESO A RUTAS POR ROLES
exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(
        new AppError('No tiene permisos para acceder', 403)
      );
    }

    next();
  };
};


// OLVIDASTE LA CONTRASEÑA?
exports.forgotPassword = catchAsync(async (req, res, next) => {
  // Busca al usuario por el email del body de la petición
  const user = await User.findOne({ email: req.body.email });

  // Si no existe el usuario, salta un error
  if (!user) {
    return next(new AppError('No existe ningun usuario con este email', 404));
  }

  // Se genera un token para restablecer la contraseña y se guarda en BD
  const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  // Se envia un email al usuario para restablecer la contraseña
  // Se crea la URL para restablecer la contraseña
  const resetURL = `${req.protocol}://${req.get(
    'host'
  )}/api/v1/users/resetPassword/${resetToken}`;

  const message = `¿Olvidaste tu contraseña? Envia la nueva contraseña y confirmacion de la misma a: ${resetURL}.\nSi no olvidaste la contraseña, ignora este email`;

  // Envio del email
  try {
    await sendEmail({
      email: user.email,
      subject: 'Tu token de restablecimiento de contraseña (valido 10 min)',
      message
    });

    res.status(200).json({
      status: 'success',
      message: 'Token enviado al email'
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('Error al enviar email de restablecimiento de contraseña. Intentalo de nuevo mas tarde'),
      500
    );
  }
});


// RESTABLECER LA CONTRASEÑA
exports.resetPassword = catchAsync(async (req, res, next) => {
  // Hashea el token que se ha enviado por email
  const hashedToken = crypto
    .createHash('sha256') // Crea un hash del token
    .update(req.params.token) 
    .digest('hex'); // Convierte el hash a hexadecimal para almacenarlo en la BD

  // Busca el usuario que tiene el token y comprueba si ha expirado
  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() }
  });

  // Si no existe el usuario o el token ha expirado, salta un error
  if (!user) {
    return next(new AppError('El token es invalido o ha expirado', 400));
  }
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  // Si todo es correcto, loguea al usuario y envía el token
  // (igual que en el login)
  createSendToken(user, 200, res);
});


// ACTUALIZAR LA CONTRASEÑA
// (cuando el usuario quiere cambiar su contraseña desde su perfil)
exports.updatePassword = catchAsync(async (req, res, next) => {
  // Coge el usuario actual
  const user = await User.findById(req.user.id).select('+password');

  // Comprueba si la contraseña actual es correcta
  if (!(await user.correctPassword(req.body.passwordCurrent, user.password))) {
    return next(new AppError('La contraseña actual es incorrecta', 401));
  }

  // Actualiza la contraseña
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  await user.save();

  // Si todo es correcto, loguea al usuario y envía el token
  createSendToken(user, 200, res);
});
