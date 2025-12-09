/**
 * Routes: Sesiones de Evaluación
 * Define todas las rutas relacionadas con sesiones
 */

const express = require('express');
const router = express.Router();
const sesionController = require('../controllers/sesionController');
const mensajeController = require('../controllers/mensajeController');

// ============================================================================
// RUTAS DE SESIONES
// ============================================================================

/**
 * GET /api/sesiones
 * Obtener todas las sesiones con paginación
 * Query: page, limit, search, estado, config_id
 */
router.get('/', sesionController.obtenerTodas);

/**
 * POST /api/sesiones
 * Crear una nueva sesión
 * Body: { config_id, candidato: { nombre, email, telefono } }
 */
router.post('/', sesionController.crear);

/**
 * POST /api/sesiones/:id/reenviar
 * Reenviar invitación a un candidato
 */
router.post('/:id/reenviar', sesionController.reenviarInvitacion);

/**
 * GET /api/sesiones/:token
 * Obtener una sesión por token
 */
router.get('/:token', sesionController.obtenerPorToken);

/**
 * GET /api/sesiones/:token/validar
 * Validar si una sesión es accesible
 */
router.get('/:token/validar', sesionController.validar);

/**
 * GET /api/sesiones/:token/resumen
 * Obtener resumen de una sesión
 */
router.get('/:token/resumen', sesionController.obtenerResumen);

/**
 * GET /api/sesiones/:token/preguntas-perfil
 * Obtener preguntas de perfil faltantes
 */
router.get('/:token/preguntas-perfil', sesionController.obtenerPreguntasPerfil);

/**
 * POST /api/sesiones/:token/iniciar
 * Iniciar una sesión (cambiar estado a "en_progreso")
 */
router.post('/:token/iniciar', sesionController.iniciar);

/**
 * POST /api/sesiones/:token/completar
 * Completar una sesión
 * Body: { puntaje_total, puntaje_maximo }
 */
router.post('/:token/completar', sesionController.completar);

/**
 * POST /api/sesiones/:token/cancelar
 * Cancelar una sesión
 */
router.post('/:token/cancelar', sesionController.cancelar);

/**
 * POST /api/sesiones/:token/finalizar
 * Finalizar evaluación (calcula puntaje automáticamente)
 * Body: { umbral_aprobacion? }
 */
router.post('/:token/finalizar', sesionController.finalizarEvaluacion);

/**
 * PUT /api/sesiones/:token
 * Actualizar una sesión
 */
router.put('/:token', sesionController.actualizar);

/**
 * DELETE /api/sesiones/:idOrToken
 * Eliminar una sesión por ID o token
 */
router.delete('/:idOrToken', sesionController.eliminar);

/**
 * POST /api/sesiones/procesar-expiradas
 * Marcar sesiones expiradas (endpoint administrativo)
 */
router.post('/procesar-expiradas', sesionController.procesarExpiradas);

// ============================================================================
// RUTAS DE MENSAJES (por sesión)
// ============================================================================

/**
 * GET /api/sesiones/:token/mensajes
 * Obtener todos los mensajes de una sesión
 * Query params: ?tipo=sistema|pregunta|respuesta (opcional)
 */
router.get('/:token/mensajes', mensajeController.obtenerPorSesion);

/**
 * GET /api/sesiones/:token/mensajes/progreso
 * Obtener progreso de la conversación
 */
router.get('/:token/mensajes/progreso', mensajeController.obtenerProgreso);

/**
 * GET /api/sesiones/:token/mensajes/siguiente-pregunta
 * Obtener la siguiente pregunta pendiente
 */
router.get('/:token/mensajes/siguiente-pregunta', mensajeController.obtenerSiguientePregunta);

/**
 * POST /api/sesiones/:token/mensajes/responder
 * Responder una pregunta
 * Body: { pregunta_id, respuesta, metadata? }
 */
router.post('/:token/mensajes/responder', mensajeController.responder);

module.exports = router;
