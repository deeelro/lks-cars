const AppError = require('../utils/appError');

// Error de ID no valido
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};
  
// Error de duplicidad de campos
const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];

    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
};

// Error de validacion
const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);

    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
};

// MANEJO DE ERRORES EN DESARROLLO
const sendErrorDev = (err, req, res) => {
    // ERROR DE LA API
    if (req.originalUrl.startsWith('/api')) {
        return res.status(err.statusCode).json({
            status: err.status,
            error: err,
            message: err.message,
            stack: err.stack
        });
    }
    
    // ERROR EN EL RENDERIZADO
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
        title: 'Algo salió mal!',
        msg: err.message
    });
};
  
// MANEJO DE ERRORES EN PRODUCCION
const sendErrorProd = (err, req, res) => {
// ERROR DE LA API
if (req.originalUrl.startsWith('/api')) {
    // OPERACIONAL
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }

    // NO OPERACIONAL
    console.error('ERROR', err);
    res.status(500).json({
        status: 'error',
        message: 'Algo salió mal! Inténtalo de nuevo más tarde.'
    });
}
// ERROR EN EL RENDERIZADO
    // OPERACIONAL
    if (err.isOperational) {
        return res.status(err.statusCode).render('error', {
            title: 'Algo salió mal!',
            msg: err.message
        });
    }

    // NO OPERACIONAL
    console.error('ERROR', err);
    return res.status(err.statusCode).render('error', {
        title: 'Algo salió mal!',
        msg: 'Por favor, intentalo de nuevo más tarde.'
    });
};


module.exports = (err, req, res, next) => {
// Aseguro que el error tenga un status code y un status
err.statusCode = err.statusCode || 500;
err.status = err.status || 'error';

if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
} else if (process.env.NODE_ENV === 'production') {
    let error = { ...err }; // copio el error para no modificar el original
    error.message = err.message; // copio el mensaje del error original

    // Uso la copia del error para manejar errores de BD
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);

    sendErrorProd(error, req, res);
}
};
