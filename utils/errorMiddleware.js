// utils/errorMiddleware.js
module.exports = (err, req, res, next) => {
    console.error('❌ ERROR:', err);

    res.status(err.statusCode || 500).json({
        status: err.status || 'error',
        message: err.message || 'Error interno del servidor'
    });
};
