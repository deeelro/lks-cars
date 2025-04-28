const mongoose = require('mongoose');

const importRequestSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'La solicitud debe pertenecer a un usuario']
  },
  car: {
    type: mongoose.Schema.ObjectId,
    ref: 'Car',
    required: [true, 'La solicitud debe referirse a un coche']
  },
  status: {
    type: String,
    enum: ['pendiente', 'aprobado', 'rechazado'],
    default: 'pendiente'
  },
  contact: {
    type: String,
    enum: ['whatsapp', 'email'],
    required: [true, 'Selecciona una forma de contacto']
  },
  date: {
    type: Date,
    default: Date.now
  }
});

const ImportRequest = mongoose.model('ImportRequest', importRequestSchema);

module.exports = ImportRequest;
