/**
 * Controller: Mensajes de Conversación
 * Maneja las peticiones HTTP relacionadas con mensajes del chatbot
 */

const mensajeService = require('../services/mensajeService');
const mensajesRepository = require('../repositories/mensajesRepository.knex');
const sesionesRepository = require('../repositories/sesionesRepository.knex');

/**
 * POST /api/mensajes
 * Crear un nuevo mensaje
 */
const crear = async (req, res, next) => {
  try {
    const { sesion_id, pregunta_id, tipo, contenido, metadata } = req.body;

    // Validar campos requeridos
    if (!sesion_id || !tipo || !contenido) {
      return res.status(400).json({
        success: false,
        message: 'Los campos "sesion_id", "tipo" y "contenido" son requeridos'
      });
    }

    // Validar tipo de mensaje
    const tiposValidos = ['sistema', 'pregunta', 'respuesta'];
    if (!tiposValidos.includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: `El tipo debe ser uno de: ${tiposValidos.join(', ')}`
      });
    }

    // Usar el servicio apropiado según el tipo
    let mensaje;
    switch (tipo) {
      case 'sistema':
        mensaje = await mensajeService.registrarSistema(sesion_id, contenido, metadata);
        break;

      case 'pregunta':
        if (!pregunta_id) {
          return res.status(400).json({
            success: false,
            message: 'El campo "pregunta_id" es requerido para tipo "pregunta"'
          });
        }
        mensaje = await mensajeService.registrarPregunta(sesion_id, pregunta_id, contenido, metadata);
        break;

      case 'respuesta':
        if (!pregunta_id) {
          return res.status(400).json({
            success: false,
            message: 'El campo "pregunta_id" es requerido para tipo "respuesta"'
          });
        }
        mensaje = await mensajeService.registrarRespuesta(sesion_id, pregunta_id, contenido, metadata);
        break;
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje registrado exitosamente',
      data: mensaje
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones/:token/mensajes
 * Obtener todos los mensajes de una sesión
 */
const obtenerPorSesion = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { tipo } = req.query;

    // Obtener sesión por token
    const sesion = await sesionesRepository.obtenerPorToken(token);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Obtener conversación
    const conversacion = await mensajeService.obtenerConversacion(sesion.id);

    // Si se especificó un tipo, filtrar
    if (tipo) {
      conversacion.mensajes = conversacion.mensajes.filter(m => m.tipo === tipo);
    }

    res.json({
      success: true,
      data: conversacion
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones/:token/mensajes/progreso
 * Obtener progreso de la sesión
 */
const obtenerProgreso = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Obtener sesión por token
    const sesion = await sesionesRepository.obtenerPorToken(token);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    const progreso = await mensajeService.obtenerProgreso(sesion.id);

    res.json({
      success: true,
      data: progreso
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones/:token/mensajes/siguiente-pregunta
 * Obtener la siguiente pregunta pendiente
 */
const obtenerSiguientePregunta = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Obtener sesión por token
    const sesion = await sesionesRepository.obtenerPorToken(token);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    const siguiente = await mensajeService.obtenerSiguientePregunta(sesion.id);

    if (!siguiente) {
      return res.json({
        success: true,
        message: 'No hay más preguntas pendientes',
        data: null
      });
    }

    res.json({
      success: true,
      data: siguiente
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sesiones/:token/mensajes/responder
 * Responder una pregunta (shortcut para crear mensaje tipo "respuesta")
 */
const responder = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { pregunta_id, respuesta, metadata } = req.body;

    if (!pregunta_id || respuesta === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Los campos "pregunta_id" y "respuesta" son requeridos'
      });
    }

    // Obtener sesión por token
    const sesion = await sesionesRepository.obtenerPorToken(token);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Validar respuesta
    const validacion = await mensajeService.validarRespuesta(pregunta_id, respuesta);
    if (!validacion.valida) {
      return res.status(400).json({
        success: false,
        message: 'Respuesta no válida',
        errores: validacion.errores
      });
    }

    // Registrar respuesta
    const mensaje = await mensajeService.registrarRespuesta(sesion.id, pregunta_id, respuesta, metadata);

    // Obtener progreso actualizado
    const progreso = await mensajeService.obtenerProgreso(sesion.id);

    res.status(201).json({
      success: true,
      message: 'Respuesta registrada exitosamente',
      data: {
        mensaje: mensaje,
        progreso: progreso
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/mensajes/:id
 * Actualizar un mensaje
 */
const actualizar = async (req, res, next) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    // Verificar que el mensaje existe
    const mensaje = await mensajesRepository.obtenerPorId(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    await mensajesRepository.actualizar(id, datos);
    const mensajeActualizado = await mensajesRepository.obtenerPorId(id);

    res.json({
      success: true,
      message: 'Mensaje actualizado exitosamente',
      data: mensajeActualizado
    });

  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/mensajes/:id
 * Eliminar un mensaje
 */
const eliminar = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verificar que el mensaje existe
    const mensaje = await mensajesRepository.obtenerPorId(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    await mensajesRepository.eliminar(id);

    res.json({
      success: true,
      message: 'Mensaje eliminado exitosamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/mensajes/:id
 * Obtener un mensaje específico
 */
const obtenerPorId = async (req, res, next) => {
  try {
    const { id } = req.params;

    const mensaje = await mensajesRepository.obtenerPorId(id);
    if (!mensaje) {
      return res.status(404).json({
        success: false,
        message: 'Mensaje no encontrado'
      });
    }

    res.json({
      success: true,
      data: mensaje
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  crear,
  obtenerPorSesion,
  obtenerProgreso,
  obtenerSiguientePregunta,
  responder,
  actualizar,
  eliminar,
  obtenerPorId
};
