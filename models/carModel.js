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
    images: [String], // Galería de imágenes
    fuelType: {
        type: String,
        enum: ['Gasolina', 'Diésel', 'Eléctrico', 'Híbrido'],
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
})

const Car = mongoose.model('Car', carSchema)
module.exports = Car;

