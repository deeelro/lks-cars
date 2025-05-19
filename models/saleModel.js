const mongoose = require('mongoose');

const saleSchema = new mongoose.Schema({
    car: {
        type: mongoose.Schema.ObjectId,
        ref: 'Car',
        required: [true, 'La venta debe pertenecer a un vehiculo.']
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: [true, 'La venta debe pertenecer a un usuario.']
    },
    price: {
        type: Number,
        required: [true, 'La venta debe tener un precio.']
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    paid: {
        type: Boolean,
        default: false
    }
});

saleSchema.pre(/^find/, function (next) {
    this.populate('user').populate({
        path: 'car',
        select: 'name'
    });
    next();
});

const Sale = mongoose.model('Sale', saleSchema);
module.exports = Sale;
