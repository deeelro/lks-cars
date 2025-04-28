// app.js
const express = require('express');
const carRouter = require('./routes/carRoutes');
const userRouter = require('./routes/userRoutes');
// const errorMiddleware = require('./utils/errorMiddleware');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

// MIDDLEWARES
app.use(express.json()); // Middleware para peticiones POST y PUT

// RUTAS
app.use('/api/v1/cars', carRouter);
app.use('/api/v1/users', userRouter);


// Gestiono rutas inexistentes
app.all('*', (req, res, next) => {
    const AppError = require('./utils/appError');
    next(new AppError(`No se encontró la ruta ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);


module.exports = app; // Exportamos la app sin iniciar el servidor
