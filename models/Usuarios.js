const mongoose = require('mongoose');
mongoose.Promise = global.Promise
const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema({
  nombre: {
    type: String,
    required: true
  },
  email: {
    type: String,
    unique: true,
    lowecase: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
    trim: true
  },
  token: String,
  expira: Date,
  imagen: String
});

//Método para hashear los passwords
usuariosSchema.pre('save', async function (next) {
  //si el password ya esta hasheado
  if (!this.isModified('password')) {
    return next() // deten la ejecución
  }
  //si no esta hasheado
  const hash = await bcrypt.hash(this.password, 12)
  this.password = hash
  next();
});

//Valida error de duplicación de email en la base de datos
usuariosSchema.post('save', function (error, doc, next){
  if(error.name === 'MongoServerError' && error.code === 11000){
    console.log(error);
    next('Ese correo ya esta registrado');
  }else{
    next(error);
  }
});

//Autenticar Usuarios
usuariosSchema.methods = {
  compararPassword: function(password){
    return bcrypt.compareSync(password, this.password)
  }
}

module.exports = mongoose.model('Usuarios', usuariosSchema);

