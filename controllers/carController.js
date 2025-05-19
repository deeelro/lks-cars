const multer = require('multer');
const sharp = require('sharp');
const Car = require('../models/carModel');
const QueryBuilder = require('../utils/queryBuilder');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const factory = require('./controllerFactory');


const multerStorage = multer.memoryStorage(); // Almacena la imagen en memoria

// Compruebo si el archivo es una imagen
const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {   // Comprobar si el archivo es una imagen
    cb(null, true); // Si es una imagen, continuar
  } else {
    cb(new AppError('Por favor, sube una imagen valida', 400), false);
  }
};

// Configuro la subida de archivos
const upload = multer({ 
  storage: multerStorage, // Almacena la imagen en memoria
  fileFilter: multerFilter // Compruebo si el archivo es una imagen
});

// Middleware para subir imágenes
exports.uploadCarImages = upload.fields([
    { name: 'coverImage', maxCount: 1 }, // Solo una imagen de portada
    { name: 'images', maxCount: 10 } // Hasta 10 imágenes adicionales
]);


// Middleware para redimensionar imágenes
exports.resizeCarImages = catchAsync(async (req, res, next) => {
    if (!req.files.coverImage) {
        return next(new AppError('La imagen de portada es obligatoria', 400));
    }

    // Procesar la imagen de portada
    req.body.coverImage = `car-${Date.now()}-cover.jpeg`;
    await sharp(req.files.coverImage[0].buffer)
        .resize(2000, 1333)
        .toFormat('jpeg')
        .jpeg({ quality: 90 })
        .toFile(`public/img/cars/${req.body.coverImage}`);

    // Procesar imágenes adicionales (si existen)
    req.body.images = [];
    if (req.files.images) {
        await Promise.all(
            req.files.images.map(async (file, i) => {
                const filename = `car-${Date.now()}-${i + 1}.jpeg`;
                await sharp(file.buffer)
                    .resize(2000, 1333)
                    .toFormat('jpeg')
                    .jpeg({ quality: 90 })
                    .toFile(`public/img/cars/${filename}`);
                req.body.images.push(filename);
            })
        );
    }

    next();
});


exports.createCar = catchAsync(async (req, res, next) => {
    const newCar = await Car.create({
        ...req.body,
        coverImage: req.body.coverImage,
        images: req.body.images
    });

    res.status(201).json({
        status: 'success',
        data: {
            car: newCar
        }
    });
});


/* exports.reserveCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
        return next(new AppError('No existe ningún coche con ese ID', 404));
    }

    if (car.reserved) {
        return next(new AppError('Este coche ya está reservado', 400));
    }

    car.reserved = true;
    car.reservedBy = req.user.id; // Asigna el ID del usuario logueado
    await car.save();

    res.status(200).json({
        status: 'success',
        data: {
            car
        }
    });
});


exports.unreserveCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id);

    if (!car) {
        return next(new AppError('No existe ningún coche con ese ID', 404));
    }

    if (!car.reserved) {
        return next(new AppError('Este coche no está reservado', 400));
    }

    // Verifica si el usuario actual es el que reservó el coche
    if (!car.reservedBy || car.reservedBy.toString() !== req.user.id.toString()) {
        return next(new AppError('No tienes permiso para desreservar este coche', 403));
    }

    car.reserved = false;
    car.reservedBy = null; // Elimina la referencia al usuario que reservó el coche
    await car.save();

    res.status(200).json({
        status: 'success',
        data: {
            car
        }
    });
});

 */



exports.getAllCars = factory.getAll(Car); 
exports.getCar = factory.getOne(Car); 
exports.createCar = factory.createOne(Car);
exports.updateCar = factory.updateOne(Car);
exports.deleteCar = factory.deleteOne(Car);


/* 
exports.getAllCars = catchAsync(async (req, res) => {
    const queryBuilder = new QueryBuilder(Car.find(), req.query)
            .filter()
            .sort()
            .limitFields()
            .paginate(5);

    const cars = await queryBuilder.query; // Busco todos los coches

    res.status(200).json({
        status: 'success',
        results: cars.length,
        data: {
            cars
        }
    });
});


exports.getCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id); // Busco el coche por ID

    if (!car) {
        return next(new AppError('No existe ningun coche con ese ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            car
        }
    });
});


exports.createCar = catchAsync(async (req, res, next) => {
    const newCar = await Car.create(req.body);

    res.status(201).json({
        status: 'success',
        message: 'Coche creado',
        data: {
            car: newCar
        }
    });
});


exports.updateCar = catchAsync(async (req, res, next) => {
    const car = await Car.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    if (!car) {
        return next(new AppError('No existe ningun coche con ese ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: {
            car
        }
    });
});


exports.deleteCar = catchAsync(async (req, res, next) => {
    const car = await Car.findByIdAndDelete(req.params.id);

    if (!car) {
        return next(new AppError('No existe ningun coche con ese ID', 404));
    }

    res.status(204).json({
        status: 'success',
        data: null
    });
}); 
*/

