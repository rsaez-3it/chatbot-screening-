/**
 * Routes: Configuración de Chatbots
 * Define todas las rutas relacionadas con configuración y preguntas
 */

const express = require('express');
const router = express.Router();
const configController = require('../controllers/configController');
const sesionController = require('../controllers/sesionController');
const invitacionController = require('../controllers/invitacionController');

// ============================================================================
// RUTAS DE CONFIGURACIÓN
// ============================================================================

/**
 * GET /api/config
 * Obtener todos los chatbots
 * Query params: ?activos=true (opcional)
 */
router.get('/', configController.obtenerTodos);

/**
 * GET /api/config/:id
 * Obtener un chatbot específico por ID
 */
router.get('/:id', configController.obtenerPorId);

/**
 * POST /api/config
 * Crear un nuevo chatbot
 */
router.post('/', configController.crear);

/**
 * PUT /api/config/:id
 * Actualizar un chatbot existente
 */
router.put('/:id', configController.actualizar);

/**
 * DELETE /api/config/:id
 * Eliminar/desactivar un chatbot
 * Query params: ?permanente=true (opcional, para eliminar permanentemente)
 */
router.delete('/:id', configController.eliminar);

// ============================================================================
// RUTAS DE PREGUNTAS
// ============================================================================

/**
 * GET /api/config/:id/preguntas
 * Obtener todas las preguntas de un chatbot
 * Query params: ?activas=true (opcional)
 */
router.get('/:id/preguntas', configController.obtenerPreguntas);

/**
 * GET /api/config/:configId/preguntas/:preguntaId
 * Obtener una pregunta específica
 */
router.get('/:configId/preguntas/:preguntaId', configController.obtenerPreguntaPorId);

/**
 * POST /api/config/:id/preguntas
 * Crear una nueva pregunta para un chatbot
 */
router.post('/:id/preguntas', configController.crearPregunta);

/**
 * PUT /api/config/:configId/preguntas/:preguntaId
 * Actualizar una pregunta existente
 */
router.put('/:configId/preguntas/:preguntaId', configController.actualizarPregunta);

/**
 * DELETE /api/config/:configId/preguntas/:preguntaId
 * Eliminar una pregunta
 */
router.delete('/:configId/preguntas/:preguntaId', configController.eliminarPregunta);

/**
 * PUT /api/config/:id/preguntas/reordenar
 * Reordenar las preguntas de un chatbot
 * Body: { "orden": [id1, id2, id3...] }
 */
router.put('/:id/preguntas/reordenar', configController.reordenarPreguntas);

// ============================================================================
// RUTAS DE SESIONES (por configuración)
// ============================================================================

/**
 * GET /api/config/:configId/sesiones
 * Obtener todas las sesiones de un chatbot
 * Query params: ?estado=pendiente&resultado=aprobado (opcional)
 */
router.get('/:configId/sesiones', sesionController.obtenerPorConfig);

/**
 * GET /api/config/:configId/sesiones/estadisticas
 * Obtener estadísticas de sesiones de un chatbot
 */
router.get('/:configId/sesiones/estadisticas', sesionController.obtenerEstadisticas);

// ============================================================================
// RUTAS DE INVITACIONES
// ============================================================================

/**
 * POST /api/config/:id/invitar
 * Enviar invitaciones por email a candidatos
 * Body: { "emails": ["email1@example.com", "email2@example.com"] }
 */
router.post('/:id/invitar', invitacionController.enviarInvitaciones);

/**
 * POST /api/config/:id/verificar-smtp
 * Verificar configuración SMTP del chatbot
 */
router.post('/:id/verificar-smtp', invitacionController.verificarSMTP);

module.exports = router;
