const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Introduce tu nombre']
  },
  email: {
    type: String,
    required: [true, 'Introduce tu email'],
    unique: true,
    lowercase: true,
    validate: [validator.isEmail, 'Introduce un email válido']
  },
  photo: { type: String, default: 'imagen-defecto.jpg' },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user'
  },
  password: {
    type: String,
    required: [true, 'Introduce tu contraseña'],
    minlength: 8,
    select: false
  },
  passwordConfirm: {
    type: String,
    required: [true, 'Confirma tu contraseña'],
    validate: {
      // Solo funciona con crear y guardar
      validator: function(el) {
        return el === this.password;
      },
      message: 'Las constraseñas no coinciden'
    }
  },
  favorites: [
    {
      type: mongoose.Schema.ObjectId,
      ref: 'Car'
    }
  ],
  passwordChangedAt: Date,
  passwordResetToken: String,
  passwordResetExpires: Date,
  active: {
    type: Boolean,
    default: true,
    select: false
  }
});


///////////////////////////////////////////
/////////////// MIDDLEWARES ///////////////
///////////////////////////////////////////
// Si se crea un nuevo usuario, se hashea la contraseña
// Si se modifica la contraseña, se hashea y se guarda
// y se elimina el campo passwordConfirm
userSchema.pre('save', async function(next) {
  // solo se ejecuta si la contraseña se modifica
  if (!this.isModified('password')) return next();

  // hashea la contraseña con un coste de 12
  this.password = await bcrypt.hash(this.password, 12);

  // borra el campo passwordConfirm
  this.passwordConfirm = undefined;
  next();
});

// Si se modifica la contraseña, se actualiza la fecha de cambio
userSchema.pre('save', function(next) {
  if (!this.isModified('password') || this.isNew) return next();

  this.passwordChangedAt = Date.now() - 1000;
  next();
});

// Elimina los usuarios que no están activos de las consultas
// (no se eliminan de la base de datos, se ocultan)
userSchema.pre(/^find/, function(next) {
  // apunta a la query actual
  this.find({ active: { $ne: false } });
  next();
});


/////////////////////////////////////////
///////////////// METODOS ///////////////
/////////////////////////////////////////
// Compara la contraseña introducida por el usuario con la contraseña hasheada en la BD
userSchema.methods.correctPassword = async function(
  candidatePassword,
  userPassword
) {
  // bcrypt.compare --> desencripta la contraseña de la BD para compararla con la introducida por el usuario
  return await bcrypt.compare(candidatePassword, userPassword);
};


userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // false significa que NO ha cambiado
  return false;
};

userSchema.methods.createPasswordResetToken = function() {
  const resetToken = crypto.randomBytes(32).toString('hex');

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  console.log({ resetToken }, this.passwordResetToken);

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

  return resetToken;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
