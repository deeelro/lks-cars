const Car = require('./../models/carModel');
const Sale = require('./../models/saleModel');
const User = require('./../models/userModel');
const Email = require('./../utils/email');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const { generatePurchasePDF } = require('../utils/pdf'); 


exports.getOverview = catchAsync(async (req, res) => {
  if (req.query.car && req.query.user && req.query.price) {
    await Car.findByIdAndUpdate(req.query.car, { sold: true });

    // Generar número de factura correlativo
    const year = new Date().getFullYear();
    const lastSale = await Sale.findOne({ invoiceNumber: { $regex: `^${year}-` } })
      .sort({ createdAt: -1 })
      .select('invoiceNumber');

    let nextNumber = 1;
    if (lastSale && lastSale.invoiceNumber) {
      const last = parseInt(lastSale.invoiceNumber.split('-')[1], 10);
      nextNumber = last + 1;
    }
    const invoiceNumber = `${year}-${String(nextNumber).padStart(3, '0')}`;

    // Crear la venta con el número de factura
    const sale = await Sale.create({
      car: req.query.car,
      user: req.query.user,
      price: req.query.price,
      invoiceNumber
    });

    const user = await User.findById(req.query.user);
    const car = await Car.findById(req.query.car);

    // Genera el PDF
    const pdfBuffer = await generatePurchasePDF(user, car, sale);

    // Envía la factura con PDF adjunto
    await new Email(user, null).sendPurchaseTicket({ sale, car, user, pdfBuffer });

    return res.redirect(req.path);
  }
  const cars = await Car.find().sort({ sold: 1});
  res.status(200).render('overview', {
    title: 'LKS Cars',
    cars
  });
});

exports.getCar = catchAsync(async (req, res, next) => {
    const car = await Car.findById(req.params.id).populate({
        path: 'reservedBy',
        select: 'id name email'
    });

    if (!car) {
        return next(new AppError('No se encontró el coche con ese ID', 404));
    }

    // Verifica si el usuario actual es el que reservó el coche
    const isReservedByCurrentUser = car.reservedBy && req.user && car.reservedBy._id.toString() === req.user.id;

    res.status(200).render('car', {
        title: `${car.brand} ${car.model}`,
        car,
        isReservedByCurrentUser // Pasa esta información a la vista
    });
});


exports.getSignupForm = (req, res) => {
  res.status(200).render('signup', {
    title: 'Regístrate'
  });
};


exports.getLoginForm = (req, res) => {
    res.status(200).render('login', {
        title: 'Log into your account'
    });
}

exports.getAccount = (req, res) => {
    console.log(req.user); // Se imprime el usuario en la consola
    res.status(200).render('account', {
        title: 'Your account',
        user: req.user // Se pasa el usuario a la vista
    });
}


exports.addCar = (req, res) => {
    res.status(200).render('addCar', {
        title: 'Añadir vehiculo',
        user: req.user // Se pasa el usuario a la vista
    });
}



exports.getManageCars = catchAsync(async (req, res, next) => {
    const cars = await Car.find();

    // Para cada coche vendido, busca el comprador
    const carsWithBuyer = await Promise.all(
        cars.map(async car => {
            let buyer = null;
            if (car.sold) {
                const sale = await Sale.findOne({ car: car._id }).populate('user', 'name email');
                if (sale && sale.user) {
                    buyer = sale.user;
                }
            }
            return { ...car.toObject(), buyer };
        })
    );

    res.status(200).render('manageCars', {
        title: 'Administrar Vehículos',
        cars: carsWithBuyer, // Pasa los vehículos a la vista
        user: req.user // Pasa el usuario a la vista
    });
});

exports.getMyPurchases = catchAsync(async (req, res) => {
    const purchases = await Sale.find({ user: req.user.id }).select('+createdAt');

    res.status(200).render('myPurchases', {
        title: 'Mis compras',
        purchases
    });
});


exports.getFavoritesView = catchAsync(async (req, res, next) => {
    const user = await User.findById(req.user.id).populate({
        path: 'favorites',
        select: 'brand model year price coverImage'
    });

    if (!user) {
        return next(new AppError('No se encontró el usuario', 404));
    }

    res.status(200).render('favorites', {
        title: 'Tus favoritos',
        favorites: user.favorites
    });
});


// ESTADISTICAS 
exports.getAdminStats = catchAsync(async (req, res, next) => {
        // Total de ingresos por mes (último año)
    const salesStats = await Sale.aggregate([
        {
            $match: {
            createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
            }
        },
        {
        $group: {
            _id: { $month: '$createdAt' },
            ventas: { $push: { car: '$car', price: '$price' } }
        }
        },
        { $sort: { _id: 1 } }
    ]);

    const filterSalesStats = [];
    for (let stat of salesStats) {
        let totalIngresos = 0;
        let totalVentas = 0;
        for (let venta of stat.ventas) {
            const carDoc = await Car.findById(venta.car);
            if (carDoc) {
            totalIngresos += venta.price;
            totalVentas += 1;
            }
        }
        filterSalesStats.push({
            _id: stat._id,
            totalIngresos,
            totalVentas
        });
    }

    // Nuevos registros de usuarios por mes (último año)
    const userStats = await User.aggregate([
        {
            $match: {
            createdAt: { $gte: new Date(new Date().getFullYear(), 0, 1) }
            }
        },
        {
            $group: {
            _id: { $month: '$createdAt' },
            totalUsuarios: { $sum: 1 }
            }
        },
        { $sort: { _id: 1 } }
    ]);

    // Usuarios más activos (por número de compras)
    const topBuyers = await Sale.aggregate([
        {
            $group: {
            _id: '$user',
            compras: { $sum: 1 }
            }
        },
        { $sort: { compras: -1 } },
        { $limit: 5 }
    ]);
    // Popula los nombres de usuario
    for (let buyer of topBuyers) {
        const user = await User.findById(buyer._id);
        buyer.name = user ? user.name : 'Usuario eliminado';
        buyer.email = user ? user.email : 'Email no disponible';
    }

    // Coches más vendidos
    const topCars = await Sale.aggregate([
        {
            $lookup: {
            from: 'cars',
            localField: 'car',
            foreignField: '_id',
            as: 'carInfo'
            }
        },
        { $unwind: '$carInfo' },
        {
            $group: {
            _id: { brand: '$carInfo.brand', model: '$carInfo.model' },
            ventas: { $sum: 1 }
            }
        },
        { $sort: { ventas: -1 } },
        { $limit: 5 }
    ]);

    const filteredTopCars = [];
    for (let car of topCars) {
        // Busca por marca y modelo normalizados
        const carDoc = await Car.findOne({
            brand: car._id.brand,
            model: car._id.model
        });
        if (carDoc) {
            car.info = `${carDoc.brand} ${carDoc.model}`;
            filteredTopCars.push(car);
        }
    }

    // Coches más añadidos a favoritos
    const favStats = await User.aggregate([
        { $unwind: '$favorites' },
        {
            $group: {
            _id: '$favorites',
            count: { $sum: 1 }
            }
        },
        { $sort: { count: -1 } },
        { $limit: 5 }
    ]);
    const filteredFavStats = [];
    for (let fav of favStats) {
        const carDoc = await Car.findById(fav._id);
        if (carDoc) {
            fav.info = `${carDoc.brand} ${carDoc.model}`;
            filteredFavStats.push(fav);
        }
    }

    // Tasa de conversión (ventas/usuarios registrados)
    const totalUsers = await User.countDocuments();
    const totalSales = await Sale.countDocuments();
    const conversionRate = totalUsers ? ((totalSales / totalUsers) * 100).toFixed(2) : 0;

    // GRAFICOS
    const meses = [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
        'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    // Ventas por mes
    const ventasPorMesLabels = filterSalesStats.map(stat => meses[stat._id - 1]);
    const ventasPorMesData = filterSalesStats.map(stat => stat.totalVentas);

    // Ingresos por mes
    const ingresosPorMesData = filterSalesStats.map(stat => stat.totalIngresos);

    // Coches más vendidos
    const topCarsLabels = filteredTopCars.map(car => car.info);
    const topCarsData = filteredTopCars.map(car => car.ventas);

    // Coches más añadidos a favoritos
    const topFavCarsLabels = filteredFavStats.map(fav => fav.info);
    const topFavCarsData = filteredFavStats.map(fav => fav.count);

    res.status(200).render('adminStats', {
        title: 'Estadísticas',
        salesStats: filterSalesStats,
        userStats,
        topBuyers,
        topCars: filteredTopCars,
        favStats: filteredFavStats,
        conversionRate,
        user: req.user, // Pasa el usuario a la vista

        ventasPorMesLabels,
        ventasPorMesData,
        ingresosPorMesData,
        topCarsLabels,
        topCarsData,
        topFavCarsLabels,
        topFavCarsData,
    });
});
