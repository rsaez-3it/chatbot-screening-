/**
 * Controller: Sesiones de Evaluación
 * Maneja las peticiones HTTP relacionadas con sesiones
 */

const sesionService = require('../services/sesionService');
const sesionesRepository = require('../repositories/sesionesRepository');
const configRepository = require('../repositories/configRepository');
const perfilService = require('../services/perfilService');

/**
 * POST /api/sesiones
 * Crear una nueva sesión
 */
const crear = async (req, res, next) => {
  try {
    const { config_id, candidato } = req.body;

    // Validar que se envió el config_id
    if (!config_id) {
      return res.status(400).json({
        success: false,
        message: 'El campo "config_id" es requerido'
      });
    }

    // Crear sesión
    const sesion = await sesionService.crearSesion(config_id, candidato);

    res.status(201).json({
      success: true,
      message: 'Sesión creada exitosamente',
      data: sesion
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones/:token
 * Obtener una sesión por token
 */
const obtenerPorToken = async (req, res, next) => {
  try {
    const { token } = req.params;

    const sesion = await sesionesRepository.obtenerSesionCompleta(token);

    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Personalizar mensaje de bienvenida con el nombre del candidato
    if (sesion.mensaje_bienvenida && sesion.candidato_nombre) {
      // Reemplazar "Hola," por "Hola [Nombre],"
      sesion.mensaje_bienvenida_personalizado = sesion.mensaje_bienvenida.replace(
        /Hola,?/i,
        `Hola ${sesion.candidato_nombre},`
      );
    } else {
      sesion.mensaje_bienvenida_personalizado = sesion.mensaje_bienvenida;
    }

    res.json({
      success: true,
      data: sesion
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones/:token/validar
 * Validar si una sesión es accesible
 */
const validar = async (req, res, next) => {
  try {
    const { token } = req.params;

    const sesion = await sesionService.validarSesion(token);

    res.json({
      success: true,
      message: 'Sesión válida',
      data: {
        token: sesion.token,
        estado: sesion.estado,
        fecha_expiracion: sesion.fecha_expiracion,
        valida: true
      }
    });

  } catch (error) {
    // Si hay error en la validación, retornar 400 con el mensaje
    return res.status(400).json({
      success: false,
      message: error.message,
      data: {
        valida: false
      }
    });
  }
};

/**
 * POST /api/sesiones/:token/iniciar
 * Iniciar una sesión
 */
const iniciar = async (req, res, next) => {
  try {
    const { token } = req.params;

    const sesion = await sesionService.iniciarSesion(token);

    res.json({
      success: true,
      message: 'Sesión iniciada correctamente',
      data: sesion
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sesiones/:token/completar
 * Completar una sesión
 */
const completar = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { puntaje_total, puntaje_maximo } = req.body;

    if (puntaje_total === undefined || puntaje_maximo === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Los campos "puntaje_total" y "puntaje_maximo" son requeridos'
      });
    }

    const sesion = await sesionService.completarSesion(token, puntaje_total, puntaje_maximo);

    res.json({
      success: true,
      message: 'Sesión completada correctamente',
      data: sesion
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sesiones/:token/cancelar
 * Cancelar una sesión
 */
const cancelar = async (req, res, next) => {
  try {
    const { token } = req.params;

    const sesion = await sesionService.cancelarSesion(token);

    res.json({
      success: true,
      message: 'Sesión cancelada correctamente',
      data: sesion
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones/:token/resumen
 * Obtener resumen de una sesión
 */
const obtenerResumen = async (req, res, next) => {
  try {
    const { token } = req.params;

    const resumen = await sesionService.obtenerResumenSesion(token);

    res.json({
      success: true,
      data: resumen
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/config/:configId/sesiones
 * Obtener todas las sesiones de un chatbot
 */
const obtenerPorConfig = async (req, res, next) => {
  try {
    const { configId } = req.params;
    const { estado, resultado } = req.query;

    // Verificar que el chatbot existe
    const config = await configRepository.obtenerPorId(configId);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot no encontrado'
      });
    }

    // Obtener sesiones con filtros
    const filtros = {};
    if (estado) filtros.estado = estado;
    if (resultado) filtros.resultado = resultado;

    const sesiones = await sesionesRepository.obtenerPorConfig(configId, filtros);

    res.json({
      success: true,
      data: sesiones,
      total: sesiones.length
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/config/:configId/sesiones/estadisticas
 * Obtener estadísticas de sesiones de un chatbot
 */
const obtenerEstadisticas = async (req, res, next) => {
  try {
    const { configId } = req.params;

    // Verificar que el chatbot existe
    const config = await configRepository.obtenerPorId(configId);
    if (!config) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot no encontrado'
      });
    }

    // Obtener estadísticas
    const estadisticas = await sesionesRepository.obtenerEstadisticas(configId);
    const conteoEstados = await sesionesRepository.contarPorEstado(configId);

    res.json({
      success: true,
      data: {
        general: estadisticas,
        por_estado: conteoEstados
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/sesiones/:token
 * Actualizar una sesión
 */
const actualizar = async (req, res, next) => {
  try {
    const { token } = req.params;
    const datos = req.body;

    // Verificar que la sesión existe
    const sesion = await sesionesRepository.obtenerPorToken(token);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Actualizar
    await sesionesRepository.actualizar(sesion.id, datos);
    const sesionActualizada = await sesionesRepository.obtenerPorToken(token);

    res.json({
      success: true,
      message: 'Sesión actualizada correctamente',
      data: sesionActualizada
    });

  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/sesiones/:idOrToken
 * Eliminar una sesión por ID o token
 */
const eliminar = async (req, res, next) => {
  try {
    const { idOrToken } = req.params;

    let sesion;

    // Si es numérico, buscar por ID
    if (!isNaN(idOrToken)) {
      sesion = await sesionesRepository.obtenerPorId(parseInt(idOrToken));
    } else {
      // Si no es numérico, buscar por token
      sesion = await sesionesRepository.obtenerPorToken(idOrToken);
    }

    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    await sesionesRepository.eliminar(sesion.id);

    res.json({
      success: true,
      message: 'Sesión eliminada correctamente'
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sesiones/procesar-expiradas
 * Marcar sesiones expiradas (endpoint administrativo)
 */
const procesarExpiradas = async (req, res, next) => {
  try {
    const cantidad = await sesionService.procesarSesionesExpiradas();

    res.json({
      success: true,
      message: `${cantidad} sesiones marcadas como expiradas`,
      data: {
        cantidad
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sesiones/:token/finalizar
 * Finalizar evaluación (calcula puntaje automáticamente y completa sesión)
 */
const finalizarEvaluacion = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { umbral_aprobacion } = req.body || {};

    const sesion = await sesionService.finalizarEvaluacion(token, umbral_aprobacion);

    res.json({
      success: true,
      message: 'Evaluación finalizada correctamente',
      data: sesion
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones/:token/preguntas-perfil
 * Obtener preguntas de perfil faltantes para una sesión
 */
const obtenerPreguntasPerfil = async (req, res, next) => {
  try {
    const { token } = req.params;

    // Obtener sesión completa
    const sesion = await sesionesRepository.obtenerSesionCompleta(token);

    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Obtener preguntas de perfil faltantes
    const preguntasFaltantes = await perfilService.obtenerPreguntasFaltantes(sesion.config_id, sesion);

    res.json({
      success: true,
      data: {
        tiene_preguntas_faltantes: preguntasFaltantes.length > 0,
        total_faltantes: preguntasFaltantes.length,
        preguntas: preguntasFaltantes,
        datos_actuales: {
          nombre: sesion.candidato_nombre,
          email: sesion.candidato_email,
          telefono: sesion.candidato_telefono
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/sesiones
 * Obtener todas las sesiones con paginación
 */
const obtenerTodas = async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search = '', estado = '', config_id } = req.query;

    // Construir filtros
    const filtros = {};
    if (estado) filtros.estado = estado;
    if (config_id) filtros.config_id = parseInt(config_id);

    // Obtener sesiones con información del chatbot
    const sesiones = await sesionesRepository.obtenerTodasConChatbot(filtros);

    // Filtrar por búsqueda si existe
    let sesionesFiltradas = sesiones;
    if (search) {
      const searchLower = search.toLowerCase();
      sesionesFiltradas = sesiones.filter(s => 
        (s.candidato_nombre && s.candidato_nombre.toLowerCase().includes(searchLower)) ||
        (s.candidato_email && s.candidato_email.toLowerCase().includes(searchLower)) ||
        (s.chatbot_nombre && s.chatbot_nombre.toLowerCase().includes(searchLower))
      );
    }

    // Paginación
    const total = sesionesFiltradas.length;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const offset = (pageNum - 1) * limitNum;
    const sesionesPaginadas = sesionesFiltradas.slice(offset, offset + limitNum);

    res.json({
      success: true,
      data: sesionesPaginadas,
      meta: {
        pagination: {
          total,
          page: pageNum - 1,
          pageCount: Math.ceil(total / limitNum),
          limit: limitNum
        }
      }
    });

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/sesiones/:id/reenviar
 * Reenviar invitación a un candidato
 */
const reenviarInvitacion = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Obtener sesión
    const sesion = await sesionesRepository.obtenerPorId(id);
    if (!sesion) {
      return res.status(404).json({
        success: false,
        message: 'Sesión no encontrada'
      });
    }

    // Obtener chatbot
    const chatbot = await configRepository.obtenerPorId(sesion.config_id);
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot no encontrado'
      });
    }

    // Generar nuevo token
    const nuevoToken = require('crypto').randomBytes(32).toString('hex');

    // Calcular nueva fecha de expiración
    const nuevaFechaExpiracion = new Date();
    nuevaFechaExpiracion.setDate(nuevaFechaExpiracion.getDate() + chatbot.duracion_dias);

    // Actualizar sesión
    await sesionesRepository.actualizar(id, {
      token: nuevoToken,
      estado: 'pendiente',
      fecha_expiracion: nuevaFechaExpiracion.toISOString().slice(0, 19).replace('T', ' ')
    });

    // Generar nuevo link
    const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const nuevoLink = `${baseUrl}/chat/${nuevoToken}`;

    // Enviar email
    const emailService = require('../../../shared/services/emailService');
    const sesionParaEmail = {
      candidato_nombre: sesion.candidato_nombre,
      candidato_email: sesion.candidato_email,
      candidato_telefono: sesion.candidato_telefono,
      token: nuevoToken,
      fecha_expiracion: nuevaFechaExpiracion
    };

    await emailService.enviarInvitacion(
      sesion.candidato_email,
      nuevoLink,
      chatbot,
      sesionParaEmail
    );

    res.json({
      success: true,
      message: 'Invitación reenviada exitosamente',
      data: {
        nuevo_token: nuevoToken,
        nueva_expiracion: nuevaFechaExpiracion
      }
    });

  } catch (error) {
    next(error);
  }
};

module.exports = {
  crear,
  obtenerPorToken,
  obtenerTodas,
  reenviarInvitacion,
  validar,
  iniciar,
  completar,
  cancelar,
  obtenerResumen,
  obtenerPorConfig,
  obtenerEstadisticas,
  actualizar,
  eliminar,
  procesarExpiradas,
  finalizarEvaluacion,
  obtenerPreguntasPerfil
};
