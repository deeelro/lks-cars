// app.js
const express = require('express');
const carRouter = require('./routes/carRoutes');
const errorMiddleware = require('./utils/errorMiddleware');

const app = express();

// MIDDLEWARES
app.use(express.json()); // Middleware para peticiones POST y PUT

// RUTAS
app.use('/api/v1/cars', carRouter);

app.use(errorMiddleware);


module.exports = app; // ⬅️ Exportamos la app sin iniciar el servidor
