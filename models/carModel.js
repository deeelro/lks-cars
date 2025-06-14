const mongoose = require('mongoose')

const carSchema = new mongoose.Schema({
    brand: {
        type: String,
        required: true
    },
    model: {
        type: String,
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    color: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    mileage: {
        type: Number,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    reserved: { // Nuevo campo para indicar si está reservado
        type: Boolean,
        default: false
    },
    coverImage: { // Imagen de portada
        type: String,
        required: true
    },
    images: [String], // Galería de imágenes
    fuelType: {
        type: String,
        enum: ['Gasolina', 'Diesel', 'Elctrico', 'Hibrido'],
        required: true
    },
    transmission: {
        type: String,
        enum: ['Manual', 'Automática'],
        required: true
    },
    doors: {
        type: Number,
        required: true
    },
    fuelConsumption: {
        type: Number,
        required: true
    },
    enginePower: {
        type: Number,
        required: true
    },
    sold: {
        type: Boolean,
        default: false
    },
})

carSchema.pre('save', function(next) {
  if (this.brand) this.brand = this.brand.trim().toUpperCase();
  if (this.model) this.model = this.model.trim().toUpperCase();
  next();
});

const Car = mongoose.model('Car', carSchema)
module.exports = Car;

