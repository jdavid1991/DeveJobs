const mongoose = require('mongoose');
require('dotenv').config({path: 'variables.env'});

//Conexión a la base de datos
mongoose.connect(process.env.DATABASE);

// Valida si existe un error en la conexion a la base de datos
mongoose.connection.on('error', (error) => {
  console.log(error);
});

// importar los modelos
require('../models/Usuarios');
require('../models/Vacantes');

