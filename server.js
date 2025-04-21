const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config.env' });

const app = require('./app'); // Importamos la app de Express

const DB = process.env.DATABASE;

// Nos conectamos a MongoDB Atlas
mongoose
  .connect(DB, {
    useNewUrlParser: true,
    useUnifiedTopology: true, // Muy importante para evitar warnings
    useFindAndModify: false 
  })
  .then(() => console.log('Conexión a MongoDB exitosa'));

// Iniciamos el servidor
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`LKS Cars corriendo en el puerto ${port}`);
});
