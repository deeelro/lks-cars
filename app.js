// app.js
const path = require('path');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');

const globalErrorHandler = require('./controllers/errorController');
const carRouter = require('./routes/carRoutes');
const userRouter = require('./routes/userRoutes');
const viewRouter = require('./routes/viewRoutes');
// const errorMiddleware = require('./utils/errorMiddleware');

const app = express();

app.set('view engine', 'pug'); // Configuración del motor de plantillas
app.set('views', path.join(__dirname, 'views')); // de aqui se cargan las vistas
app.use(express.static(path.join(__dirname, 'public'))); // de aqui se cargan archivos estáticos

app.use(cors({  // Middleware para permitir peticiones de otros dominios
    origin: 'http://localhost:3000',
    credentials: true, // Permitir cookies y credenciales
})); 

// MIDDLEWARES
app.use(express.json()); // Middleware para peticiones POST y PUT
app.use(cookieParser()); // Middleware para parsear cookies

// RUTAS
app.use('/', viewRouter);
app.use('/api/v1/cars', carRouter);
app.use('/api/v1/users', userRouter);


// Gestiono rutas inexistentes
app.all('*', (req, res, next) => {
    const AppError = require('./utils/appError');
    next(new AppError(`No se encontró la ruta ${req.originalUrl}`, 404));
});

app.use(globalErrorHandler);


module.exports = app; // Exportamos la app sin iniciar el servidor
