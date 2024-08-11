const passport = require('passport');
const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante')
const Usuarios = mongoose.model('Usuarios')
const crypto = require('crypto')
const enviarEmail = require('../handlers/email')

exports.autenticarUsuario = passport.authenticate('local', {
  successRedirect: '/administracion',
  failureRedirect: '/iniciar-sesion',
  failureFlash: true,
  badRequestMessage: 'Ambos campos son obligatorios'
})

// Revisar si el usuario esta autenticado o no
exports.verificarUsuario = (req, res, next) => {
  if (req.isAuthenticated()) {
    return next(); // estan autenticados
  }
  //redirección
  res.redirect('/iniciar-sesion');
}

exports.mostrarPanel = async (req, res) => {

  //consultar el usuario autenticado
  const vacantes = await Vacante.find({ autor: req.user._id }).lean()

  res.render('administracion', {
    nombrePagina: 'Panel de Administración',
    tagline: 'Crear y Administra tus vacantes desde aqui',
    cerrarSesion: true,
    nombre: req.user.nombre,
    imagen: req.user.imagen,
    vacantes
  })
}

exports.cerrarSesion = (req, res) => {
  req.logout(() => {
    req.flash('correcto', 'Cerraste Sesión Correctamente');
    return res.redirect('/iniciar-sesion');
  });

}

// Formulario para Reiniciar Passwor
exports.formReestablecerPassword = (req, res) => {
  res.render('reestablecer-password', {
    nombrePagina: 'Reestablecer tu Password',
    tagline: 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
  })
}

//Generar el token en la tabla del usuario
exports.enviarToken = async (req, res) => {
  const usuario = await Usuarios.findOne({ email: req.body.email })

  if (!usuario) {
    req.flash('error', 'Usuario no encontrado')
    return res.redirect('/iniciar-sesion')
  }

  // el usuario existe, generar token
  usuario.token = crypto.randomBytes(20).toString('hex')
  usuario.expira = Date.now() + 360000

  // Guardar el usuario
  await usuario.save()
  const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`

  console.log(resetUrl)

  //Enviar notificación por Email
  await enviarEmail.enviar({
    usuario,
    subject: 'Password Reset',
    resetUrl,
    archivo: 'reset'
  })

  req.flash('correcto', 'Revisa tu email para los indicaciones')
  res.redirect('/iniciar-sesion')

}

// Valida si el token es valido y el usuario existe, muestra la vista
exports.reestablecerPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
    token: req.params.token,
    expira: {
      $gt: Date.now()
    }
  })

  if (!usuario) {
    req.flash('error', 'El formulario ya no es valido')
    return res.redirect('/reestablecer-password')
  }

  //si todo esta bien, mostrar el formulario
  res.render('nuevo-password', {
    nombrePagina: 'Nuevo Password'
  })
}

//Almacena el nuevo password en la DB
exports.guardarPassword = async (req, res) => {
  const usuario = await Usuarios.findOne({
    token: req.params.token,
    expira: {
      $gt: Date.now()
    }
  })

  if (!usuario) {
    req.flash('error', 'El formulario ya no es valido')
    return res.redirect('/reestablecer-password')
  }

  //Asignar un nuevo password, limpiar valores previos
  usuario.password = req.body.password
  usuario.token = undefined
  usuario.expira = undefined

  //Guardar password en la DB
  await usuario.save()
  
  //redirigir
  req.flash('correcto', 'Password Modificado Correctamente')
  res.redirect('/iniciar-sesion')

}