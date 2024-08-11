const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');
const vacantesController = require('../controllers/vacantesController');
const usuariosController = require('../controllers/usuariosController');
const authController = require('../controllers/authController');


module.exports = () => {
  router.get('/', homeController.mostrarTrabajos);

  //crear Vacantes
  router.get('/vacantes/nueva', authController.verificarUsuario, vacantesController.formularioNuevaVacante);
  router.post('/vacantes/nueva', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.agregarVacante);

  //mostrar vacante(singular)
  router.get('/vacantes/:url', vacantesController.mostrarVacante);

  //Editar vacante
  router.get('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.formEditarVacante);
  router.post('/vacantes/editar/:url', authController.verificarUsuario, vacantesController.validarVacante, vacantesController.editarVacante);

  //Eliminar vacantes
  router.delete('/vacantes/eliminar/:id', vacantesController.eliminarVacante);

  //crear cuenta
  router.get('/crear-cuenta', usuariosController.formCrearCuenta);
  router.post('/crear-cuenta', usuariosController.validarRegistro, usuariosController.crearUsuario);

  //Autenticar Usuario
  router.get('/iniciar-sesion', usuariosController.formIniciarSesion);
  router.post('/iniciar-sesion', authController.autenticarUsuario);

  //Resetear password (emails)
  router.get('/reestablecer-password', authController.formReestablecerPassword)
  router.post('/reestablecer-password', authController.enviarToken)

  //resetear password (Almacenar en la DB)
  router.get('/reestablecer-password/:token', authController.reestablecerPassword)
  router.post('/reestablecer-password/:token', authController.guardarPassword)

  // Cerrar Sesion
  router.get('/cerrar-sesion', authController.verificarUsuario, authController.cerrarSesion);

  // Panel de administracion
  router.get('/administracion', authController.verificarUsuario, authController.mostrarPanel);

  // editar perfil
  router.get('/editar-perfil', authController.verificarUsuario, usuariosController.formEditarPerfil)
  router.post('/editar-perfil', 
    authController.verificarUsuario, 
    // usuariosController.validarPerfil,
    usuariosController.subirImagen,
    usuariosController.editarPerfil
  )

  //Recibir mensajes de Candidatos
  router.post('/vacantes/:url', vacantesController.subirCV, vacantesController.contactar)

  // Muestra candidatos por vacante
  router.get('/candidatos/:id', authController.verificarUsuario, vacantesController.mostrarCandidatos)

  //Buscador Vacante
  router.post('/buscador', vacantesController.buscadorVacante);

  return router
}