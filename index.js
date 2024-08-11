const mongoose = require('mongoose');

// importar la base de datos
require('./config/db');

const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const router = require('./routes/index');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const bodyParser = require('body-parser');
const expressValidator = require('express-validator');
const flash = require('connect-flash');
const createError = require('http-errors');
const passport = require('./config/passport');

require('dotenv').config({ path: 'variables.env' });

// Middleware
const morgan = require('morgan');

//Instancia del servidor express 
const app = express();

//habilitar morgan
app.use(morgan('dev'));

//habilitar body-parser
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

//validación de campos
app.use(expressValidator());

// Habilitar handlebars como view
app.engine('handlebars',
  exphbs.engine({
    defaultLayout: 'layout',
    helpers: require('./helpers/handelbars')
  })
);
app.set('view engine', 'handlebars');

//static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

app.use(session({
  secret: process.env.SECRETO,
  key: process.env.KEY,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.DATABASE })
}))

//iniciar passport
app.use(passport.initialize());
app.use(passport.session());

//Alerta y flash messages
app.use(flash());

//crear nuestros middleware
app.use((req, res, next) => {
  res.locals.mensajes = req.flash();
  next()
})

app.use('/', router());

//404 Pagina no encontrada
app.use((req, res, next) => {
  next(createError(400, 'No encontrado'))
})

// Administración de los errores
app.use((error, req, res, next ) => {
  res.locals.mensaje = error.message;
  const status = error.status || 500
  res.locals.status = status;
  res.status(status)
  res.render('error')
})

// Puerto
app.listen(process.env.PUERTO);