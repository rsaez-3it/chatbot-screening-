/**
 * Service: Lógica de Negocio de Mensajes
 * Funciones auxiliares para gestión de mensajes del chatbot
 */

const mensajesRepository = require('../repositories/mensajesRepository.knex');
const sesionesRepository = require('../repositories/sesionesRepository.knex');
const preguntasRepository = require('../repositories/preguntasRepository.knex');
const evaluacionService = require('./evaluacion/evaluacionService');
const perfilService = require('./perfilService');

/**
 * Registrar un mensaje del sistema
 * @param {number} sesionId - ID de la sesión
 * @param {string} contenido - Contenido del mensaje
 * @param {Object} metadata - Metadata adicional (opcional)
 * @returns {Promise<Object>} Mensaje creado
 */
const registrarSistema = async (sesionId, contenido, metadata = null) => {
  try {
    // Verificar que la sesión existe
    const sesion = await sesionesRepository.obtenerPorId(sesionId);
    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    const datos = {
      sesion_id: sesionId,
      tipo: 'sistema',
      contenido: contenido,
      metadata: metadata
    };

    const mensajeId = await mensajesRepository.crear(datos);
    return await mensajesRepository.obtenerPorId(mensajeId);

  } catch (error) {
    throw new Error(`Error al registrar mensaje del sistema: ${error.message}`);
  }
};

/**
 * Registrar una pregunta del chatbot
 * @param {number} sesionId - ID de la sesión
 * @param {number} preguntaId - ID de la pregunta
 * @param {string} contenido - Contenido de la pregunta (opcional, se obtiene de la BD)
 * @param {Object} metadata - Metadata adicional (opcional)
 * @returns {Promise<Object>} Mensaje creado
 */
const registrarPregunta = async (sesionId, preguntaId, contenido = null, metadata = null) => {
  try {
    // Verificar que la sesión existe
    const sesion = await sesionesRepository.obtenerPorId(sesionId);
    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // Verificar que la pregunta existe
    const pregunta = await preguntasRepository.obtenerPorId(preguntaId);
    if (!pregunta) {
      throw new Error('Pregunta no encontrada');
    }

    // Si no se proporcionó contenido, usar el texto de la pregunta
    const textoMensaje = contenido || pregunta.pregunta;

    const datos = {
      sesion_id: sesionId,
      pregunta_id: preguntaId,
      tipo: 'pregunta',
      contenido: textoMensaje,
      metadata: metadata || {
        tipo_campo: pregunta.tipo_campo,
        descripcion: pregunta.descripcion,
        media_url: pregunta.media_url,
        opciones: pregunta.opciones ? JSON.parse(pregunta.opciones) : null
      }
    };

    const mensajeId = await mensajesRepository.crear(datos);
    return await mensajesRepository.obtenerPorId(mensajeId);

  } catch (error) {
    throw new Error(`Error al registrar pregunta: ${error.message}`);
  }
};

/**
 * Registrar una respuesta del candidato
 * @param {number} sesionId - ID de la sesión
 * @param {number} preguntaId - ID de la pregunta
 * @param {string} contenido - Respuesta del candidato
 * @param {Object} metadata - Metadata adicional (opcional)
 * @returns {Promise<Object>} Mensaje creado
 */
const registrarRespuesta = async (sesionId, preguntaId, contenido, metadata = null) => {
  try {
    // Verificar que la sesión existe
    const sesion = await sesionesRepository.obtenerPorId(sesionId);
    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // Verificar que la sesión esté en progreso
    if (sesion.estado !== 'en_progreso') {
      throw new Error('La sesión no está activa para recibir respuestas');
    }

    // Verificar que la pregunta existe
    const pregunta = await preguntasRepository.obtenerPorId(preguntaId);
    if (!pregunta) {
      throw new Error('Pregunta no encontrada');
    }

    // Verificar si ya existe una respuesta para esta pregunta
    const yaRespondio = await mensajesRepository.existeRespuesta(sesionId, preguntaId);
    if (yaRespondio) {
      throw new Error('Ya existe una respuesta para esta pregunta');
    }

    // Validar que la respuesta no esté vacía si la pregunta es requerida
    if (pregunta.requerida && (!contenido || contenido.trim() === '')) {
      throw new Error('La respuesta es requerida');
    }

    const datos = {
      sesion_id: sesionId,
      pregunta_id: preguntaId,
      tipo: 'respuesta',
      contenido: contenido,
      metadata: metadata
    };

    const mensajeId = await mensajesRepository.crear(datos);
    const mensaje = await mensajesRepository.obtenerPorId(mensajeId);

    // 👤 PREGUNTA DE PERFIL: Guardar en sesión, NO evaluar
    if (perfilService.esPreguntaPerfil(pregunta)) {
      console.log(`👤 Guardando dato de perfil: ${pregunta.campo_perfil}`);
      
      try {
        // Validar formato de la respuesta
        const validacion = perfilService.validarRespuestaPerfil(pregunta, contenido);
        
        if (!validacion.valido) {
          mensaje.validacion_perfil = {
            valido: false,
            mensaje: validacion.mensaje
          };
          return mensaje;
        }

        // Guardar en la sesión
        await perfilService.guardarRespuestaPerfil(sesionId, pregunta, contenido);
        
        mensaje.es_dato_perfil = true;
        mensaje.validacion_perfil = {
          valido: true,
          mensaje: 'Dato guardado correctamente'
        };
        
        console.log(`✅ Dato de perfil guardado: ${pregunta.campo_perfil} = ${contenido}`);
        
      } catch (perfilError) {
        console.error('⚠️  Error al guardar dato de perfil:', perfilError);
        mensaje.validacion_perfil = {
          valido: false,
          mensaje: 'Error al guardar el dato'
        };
      }
      
      return mensaje;
    }

    // 🔥 AUTO-EVALUACIÓN: Evaluar la respuesta automáticamente (solo preguntas normales)
    console.log(`🤖 Evaluando automáticamente respuesta del mensaje ${mensajeId}`);

    try {
      const resultadoEvaluacion = await evaluacionService.evaluar(
        pregunta,
        contenido,
        sesionId,
        mensajeId
      );

      // Agregar evaluación al objeto de retorno
      mensaje.evaluacion = resultadoEvaluacion;

      console.log(`✅ Evaluación automática completada - Cumple: ${resultadoEvaluacion.evaluacion?.cumple}, Puntaje: ${resultadoEvaluacion.evaluacion?.puntaje}`);

    } catch (evaluacionError) {
      console.error('⚠️  Error en evaluación automática:', evaluacionError);
      // No lanzar error, solo advertir - el mensaje se guardó correctamente
      mensaje.evaluacion = {
        success: false,
        error: evaluacionError.message,
        nota: 'Error en evaluación automática, pero la respuesta se guardó correctamente'
      };
    }

    return mensaje;

  } catch (error) {
    throw new Error(`Error al registrar respuesta: ${error.message}`);
  }
};

/**
 * Obtener conversación completa de una sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Object>} Conversación estructurada
 */
const obtenerConversacion = async (sesionId) => {
  try {
    // Verificar que la sesión existe
    const sesion = await sesionesRepository.obtenerPorId(sesionId);
    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // Obtener todos los mensajes
    const mensajes = await mensajesRepository.obtenerConversacionCompleta(sesionId);

    // Obtener estadísticas
    const conteo = await mensajesRepository.contarPorTipo(sesionId);

    return {
      sesion_id: sesionId,
      total_mensajes: mensajes.length,
      conteo_por_tipo: conteo,
      mensajes: mensajes.map(m => ({
        id: m.id,
        tipo: m.tipo,
        contenido: m.contenido,
        pregunta_id: m.pregunta_id,
        texto_pregunta: m.texto_pregunta,
        tipo_campo: m.tipo_campo,
        metadata: m.metadata ? JSON.parse(m.metadata) : null,
        created_at: m.created_at
      }))
    };

  } catch (error) {
    throw new Error(`Error al obtener conversación: ${error.message}`);
  }
};

/**
 * Obtener progreso de la sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Object>} Progreso de la sesión
 */
const obtenerProgreso = async (sesionId) => {
  try {
    const sesion = await sesionesRepository.obtenerPorId(sesionId);
    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // Obtener total de preguntas del chatbot
    const totalPreguntas = await preguntasRepository.contar(sesion.config_id, true);

    // Obtener respuestas registradas
    const respuestas = await mensajesRepository.obtenerRespuestasSesion(sesionId);

    const porcentajeProgreso = totalPreguntas > 0
      ? ((respuestas.length / totalPreguntas) * 100).toFixed(2)
      : 0;

    return {
      total_preguntas: totalPreguntas,
      respondidas: respuestas.length,
      pendientes: totalPreguntas - respuestas.length,
      porcentaje_progreso: parseFloat(porcentajeProgreso),
      completado: respuestas.length === totalPreguntas
    };

  } catch (error) {
    throw new Error(`Error al obtener progreso: ${error.message}`);
  }
};

/**
 * Obtener siguiente pregunta pendiente
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Object|null>} Siguiente pregunta o null si no hay más
 */
const obtenerSiguientePregunta = async (sesionId) => {
  try {
    const sesion = await sesionesRepository.obtenerPorId(sesionId);
    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // Obtener todas las preguntas del chatbot
    const todasPreguntas = await preguntasRepository.obtenerPorConfig(sesion.config_id, true);

    // Obtener preguntas ya realizadas en la sesión
    const preguntasRealizadas = await mensajesRepository.obtenerPreguntasSesion(sesionId);
    const idsRealizadas = preguntasRealizadas.map(p => p.pregunta_id);

    // Buscar la primera pregunta no realizada
    const siguientePregunta = todasPreguntas.find(p => !idsRealizadas.includes(p.id));

    return siguientePregunta || null;

  } catch (error) {
    throw new Error(`Error al obtener siguiente pregunta: ${error.message}`);
  }
};

/**
 * Validar respuesta según las reglas de la pregunta
 * @param {number} preguntaId - ID de la pregunta
 * @param {string} respuesta - Respuesta del candidato
 * @returns {Promise<Object>} Resultado de la validación
 */
const validarRespuesta = async (preguntaId, respuesta) => {
  try {
    const pregunta = await preguntasRepository.obtenerPorId(preguntaId);
    if (!pregunta) {
      throw new Error('Pregunta no encontrada');
    }

    const errores = [];

    // Validar si es requerida
    if (pregunta.requerida && (!respuesta || respuesta.trim() === '')) {
      errores.push('La respuesta es requerida');
    }

    // Validar longitud mínima
    if (pregunta.min_longitud && respuesta.length < pregunta.min_longitud) {
      errores.push(`La respuesta debe tener al menos ${pregunta.min_longitud} caracteres`);
    }

    // Validar longitud máxima
    if (pregunta.max_longitud && respuesta.length > pregunta.max_longitud) {
      errores.push(`La respuesta no debe exceder ${pregunta.max_longitud} caracteres`);
    }

    // Validar patrón (regex)
    if (pregunta.patron_validacion) {
      const regex = new RegExp(pregunta.patron_validacion);
      if (!regex.test(respuesta)) {
        errores.push('La respuesta no cumple con el formato requerido');
      }
    }

    return {
      valida: errores.length === 0,
      errores: errores
    };

  } catch (error) {
    throw new Error(`Error al validar respuesta: ${error.message}`);
  }
};

module.exports = {
  registrarSistema,
  registrarPregunta,
  registrarRespuesta,
  obtenerConversacion,
  obtenerProgreso,
  obtenerSiguientePregunta,
  validarRespuesta
};
