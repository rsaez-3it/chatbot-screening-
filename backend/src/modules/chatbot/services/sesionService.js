/**
 * Service: Lógica de Negocio de Sesiones
 * Funciones auxiliares para gestión de sesiones
 */

const crypto = require('crypto');
const sesionesRepository = require('../repositories/sesionesRepository');
const configRepository = require('../repositories/configRepository');
const mensajesRepository = require('../repositories/mensajesRepository');
const evaluacionesRepository = require('../repositories/evaluacionesRepository');
const evaluacionService = require('./evaluacion/evaluacionService');
const emailService = require('../../../shared/services/emailService');

/**
 * Generar un token único para la sesión
 * @returns {string} Token único
 */
const generarToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Calcular fecha de expiración basada en la configuración del chatbot
 * @param {number} duracionDias - Días de duración
 * @returns {Date} Fecha de expiración
 */
const calcularFechaExpiracion = (duracionDias = 7) => {
  const fecha = new Date();
  fecha.setDate(fecha.getDate() + duracionDias);
  return fecha;
};

/**
 * Crear una nueva sesión para un candidato
 * @param {number} configId - ID del chatbot
 * @param {Object} datosCandidato - Datos del candidato
 * @returns {Promise<Object>} Sesión creada con token
 */
const crearSesion = async (configId, datosCandidato = {}) => {
  try {
    // Obtener configuración del chatbot
    const config = await configRepository.obtenerPorId(configId);

    if (!config) {
      throw new Error('Chatbot no encontrado');
    }

    if (!config.activo) {
      throw new Error('El chatbot no está activo');
    }

    // Generar token único
    let token = generarToken();

    // Verificar que el token sea único (muy improbable que se repita, pero por seguridad)
    let existeToken = await sesionesRepository.obtenerPorToken(token);
    while (existeToken) {
      token = generarToken();
      existeToken = await sesionesRepository.obtenerPorToken(token);
    }

    // Calcular fecha de expiración
    const fechaExpiracion = calcularFechaExpiracion(config.duracion_dias);

    // Crear datos de la sesión
    const datosSesion = {
      config_id: configId,
      token: token,
      estado: 'pendiente',
      resultado: 'sin_evaluar',
      puntaje_total: 0.00,
      porcentaje: 0.00,
      candidato_nombre: datosCandidato.nombre || null,
      candidato_email: datosCandidato.email || null,
      candidato_telefono: datosCandidato.telefono || null,
      fecha_expiracion: fechaExpiracion,
      metadata: datosCandidato.metadata || null
    };

    // Crear sesión en la base de datos
    const sesionId = await sesionesRepository.crear(datosSesion);

    // Obtener sesión completa
    const sesion = await sesionesRepository.obtenerPorId(sesionId);

    const sesionCompleta = {
      ...sesion,
      url_sesion: `/chatbot/${token}` // URL para que el candidato acceda
    };

    // 📧 ENVIAR EMAIL DE INVITACIÓN (si tiene email)
    if (datosCandidato.email) {
      try {
        const chatbotUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/chatbot/${token}`;

        await emailService.enviarInvitacion(
          datosCandidato.email,
          chatbotUrl,
          config,
          sesion
        );

        console.log(`✅ Email de invitación enviado a ${datosCandidato.email}`);
      } catch (emailError) {
        // No lanzar error, solo advertir - la sesión se creó correctamente
        console.warn(`⚠️  Error al enviar email de invitación: ${emailError.message}`);
      }
    }

    return sesionCompleta;

  } catch (error) {
    throw new Error(`Error al crear sesión: ${error.message}`);
  }
};

/**
 * Validar que una sesión sea accesible
 * @param {string} token - Token de la sesión
 * @returns {Promise<Object>} Sesión validada
 */
const validarSesion = async (token) => {
  try {
    // Obtener sesión
    const sesion = await sesionesRepository.obtenerPorToken(token);

    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // Verificar si está expirada
    const estaExpirada = await sesionesRepository.estaExpirada(sesion.id);

    if (estaExpirada) {
      // Marcar como expirada
      await sesionesRepository.actualizar(sesion.id, { estado: 'expirado' });
      throw new Error('La sesión ha expirado');
    }

    // Verificar si está completada
    if (sesion.estado === 'completado') {
      throw new Error('La sesión ya ha sido completada');
    }

    // Verificar si está cancelada
    if (sesion.estado === 'cancelado') {
      throw new Error('La sesión ha sido cancelada');
    }

    return sesion;

  } catch (error) {
    throw error;
  }
};

/**
 * Iniciar una sesión (cambiar estado a "en_progreso")
 * @param {string} token - Token de la sesión
 * @returns {Promise<Object>} Sesión actualizada
 */
const iniciarSesion = async (token) => {
  try {
    // Validar sesión
    const sesion = await validarSesion(token);

    // Solo se puede iniciar si está pendiente
    if (sesion.estado !== 'pendiente') {
      throw new Error('La sesión ya ha sido iniciada');
    }

    // Actualizar estado
    await sesionesRepository.actualizar(sesion.id, {
      estado: 'en_progreso',
      fecha_inicio: new Date()
    });

    // Retornar sesión actualizada
    return await sesionesRepository.obtenerPorToken(token);

  } catch (error) {
    throw error;
  }
};

/**
 * Calcular resultado de una sesión basado en puntaje y umbral
 * @param {number} porcentaje - Porcentaje obtenido
 * @param {number} umbralAprobacion - Umbral de aprobación del chatbot
 * @returns {string} 'aprobado' o 'rechazado'
 */
const calcularResultado = (porcentaje, umbralAprobacion) => {
  return porcentaje >= umbralAprobacion ? 'aprobado' : 'rechazado';
};

/**
 * Completar una sesión (calcular puntaje final y resultado)
 * @param {string} token - Token de la sesión
 * @param {number} puntajeTotal - Puntaje total obtenido
 * @param {number} puntajeMaximo - Puntaje máximo posible
 * @returns {Promise<Object>} Sesión completada
 */
const completarSesion = async (token, puntajeTotal, puntajeMaximo) => {
  try {
    // Obtener sesión completa con datos del chatbot
    const sesion = await sesionesRepository.obtenerSesionCompleta(token);

    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // Calcular porcentaje
    const porcentaje = puntajeMaximo > 0 ? (puntajeTotal / puntajeMaximo) * 100 : 0;

    // Calcular resultado
    const resultado = calcularResultado(porcentaje, sesion.umbral_aprobacion);

    // Actualizar sesión
    await sesionesRepository.actualizar(sesion.id, {
      estado: 'completado',
      puntaje_total: puntajeTotal,
      porcentaje: porcentaje.toFixed(2),
      resultado: resultado,
      fecha_completado: new Date()
    });

    // Retornar sesión actualizada
    return await sesionesRepository.obtenerSesionCompleta(token);

  } catch (error) {
    throw new Error(`Error al completar sesión: ${error.message}`);
  }
};

/**
 * Cancelar una sesión
 * @param {string} token - Token de la sesión
 * @returns {Promise<Object>} Sesión cancelada
 */
const cancelarSesion = async (token) => {
  try {
    const sesion = await sesionesRepository.obtenerPorToken(token);

    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    if (sesion.estado === 'completado') {
      throw new Error('No se puede cancelar una sesión completada');
    }

    await sesionesRepository.actualizar(sesion.id, {
      estado: 'cancelado'
    });

    return await sesionesRepository.obtenerPorToken(token);

  } catch (error) {
    throw error;
  }
};

/**
 * Verificar y marcar sesiones expiradas de manera periódica
 * @returns {Promise<number>} Número de sesiones marcadas como expiradas
 */
const procesarSesionesExpiradas = async () => {
  try {
    return await sesionesRepository.marcarExpiradas();
  } catch (error) {
    throw new Error(`Error al procesar sesiones expiradas: ${error.message}`);
  }
};

/**
 * Finalizar evaluación de una sesión (calcula puntaje automáticamente)
 * @param {string} token - Token de la sesión
 * @param {number} umbralAprobacion - Umbral de aprobación (opcional, usa el del chatbot)
 * @returns {Promise<Object>} Sesión completada con resultado
 */
const finalizarEvaluacion = async (token, umbralAprobacion = null) => {
  try {
    console.log(`🏁 Finalizando evaluación para sesión: ${token}`);

    // 1. Obtener sesión completa
    const sesion = await sesionesRepository.obtenerSesionCompleta(token);

    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    // 1.5. Verificar que no esté ya completada (evitar duplicados)
    if (sesion.estado === 'completado') {
      console.log(`⚠️  La sesión ${token} ya está completada. No se enviarán emails duplicados.`);
      return sesion;
    }

    // 2. Validar que se puede finalizar
    const validacion = await evaluacionService.validarFinalizacion(sesion.id);

    if (!validacion.puede_finalizar) {
      throw new Error(validacion.razon);
    }

    // 3. Usar umbral del chatbot si no se proporciona uno
    const umbral = umbralAprobacion !== null ? umbralAprobacion : sesion.umbral_aprobacion;

    // 4. Determinar resultado usando evaluacionService
    const resultado = await evaluacionService.determinarResultado(sesion.id, umbral);

    // 5. Actualizar sesión con resultado
    await sesionesRepository.actualizar(sesion.id, {
      estado: 'completado',
      puntaje_total: resultado.puntaje_total,
      porcentaje: resultado.porcentaje,
      resultado: resultado.resultado,
      fecha_completado: new Date()
    });

    // 6. Obtener sesión actualizada
    const sesionFinalizada = await sesionesRepository.obtenerSesionCompleta(token);

    console.log(`✅ Evaluación finalizada - Resultado: ${resultado.resultado} (${resultado.porcentaje}%)`);
    console.log(`📧 Email reclutador configurado: ${sesionFinalizada.email_reclutador || 'NO CONFIGURADO'}`);

    // 📧 ENVIAR EMAILS AUTOMÁTICOS
    // 7. NO enviar email al candidato (solo el reclutador recibe notificación)
    // El candidato ya vio el mensaje de finalización en el chatbot
    console.log(`ℹ️  No se envía email al candidato (${sesionFinalizada.candidato_email}) - Solo notificación al reclutador`);

    // 8. Notificar al reclutador (si está configurado) con TODA LA INFORMACIÓN
    if (sesionFinalizada.email_reclutador) {
      try {
        console.log(`📧 Preparando notificación para reclutador: ${sesionFinalizada.email_reclutador}`);
        
        // Obtener TODOS los mensajes de la conversación
        const mensajes = await mensajesRepository.obtenerPorSesion(sesion.id);
        console.log(`📝 Mensajes obtenidos: ${mensajes.length}`);

        // Obtener TODAS las evaluaciones con detalles
        const evaluacionesRaw = await evaluacionesRepository.obtenerPorSesion(sesion.id);
        console.log(`📊 Evaluaciones obtenidas: ${evaluacionesRaw.length}`);

        // Enriquecer evaluaciones con texto de respuesta y mapear campos
        const evaluaciones = evaluacionesRaw.map(evaluacion => {
          // Buscar mensaje de respuesta correspondiente
          const mensajeRespuesta = mensajes.find(
            m => m.pregunta_id === evaluacion.pregunta_id && m.tipo === 'respuesta'
          );

          return {
            pregunta_texto: evaluacion.pregunta || 'Pregunta sin texto',
            respuesta_texto: mensajeRespuesta?.contenido || 'Sin respuesta',
            es_correcta: evaluacion.cumple === 1 || evaluacion.cumple === true,
            puntaje: parseFloat(evaluacion.puntaje) || 0,
            peso: parseFloat(evaluacion.peso) || 1,
            metodo_evaluacion: evaluacion.metodo_evaluacion || 'desconocido',
            retroalimentacion: evaluacion.razon || 'Sin retroalimentación',
            detalle_evaluacion: evaluacion.detalles ?
              (typeof evaluacion.detalles === 'string' ? 
                (() => {
                  try {
                    return JSON.parse(evaluacion.detalles);
                  } catch (e) {
                    console.warn('⚠️  Error al parsear detalles de evaluación:', e);
                    return null;
                  }
                })()
                : evaluacion.detalles)
              : null
          };
        });
        
        console.log(`✅ Evaluaciones procesadas: ${evaluaciones.length}`);

        // Preparar datos COMPLETOS para el email
        const sesionDataCompleta = {
          ...sesionFinalizada,
          mensajes: mensajes.map(m => ({
            ...m,
            tipo_mensaje: m.tipo,
            fecha_creacion: m.created_at
          })),
          evaluaciones: evaluaciones,
          puntaje_maximo: resultado.puntaje_maximo || 100,
          porcentaje_aprobacion: parseFloat(resultado.porcentaje) || 0,
          umbral_aprobacion: umbral
        };

        console.log('📧 Enviando notificación al reclutador...');
        await emailService.notificarReclutador(sesionFinalizada.email_reclutador, sesionDataCompleta);
        console.log(`✅ Notificación completa enviada al reclutador: ${sesionFinalizada.email_reclutador}`);
      } catch (emailError) {
        console.error(`❌ Error al notificar al reclutador: ${emailError.message}`);
        console.error('Stack trace:', emailError.stack);
        // No lanzar el error, solo registrarlo - la sesión ya está finalizada
      }
    }

    return {
      ...sesionFinalizada,
      detalle_evaluacion: resultado
    };

  } catch (error) {
    throw new Error(`Error al finalizar evaluación: ${error.message}`);
  }
};

/**
 * Obtener resumen de una sesión para mostrar al candidato
 * @param {string} token - Token de la sesión
 * @returns {Promise<Object>} Resumen de la sesión
 */
const obtenerResumenSesion = async (token) => {
  try {
    const sesion = await sesionesRepository.obtenerSesionCompleta(token);

    if (!sesion) {
      throw new Error('Sesión no encontrada');
    }

    return {
      token: sesion.token,
      estado: sesion.estado,
      resultado: sesion.resultado,
      porcentaje: parseFloat(sesion.porcentaje),
      puntaje_total: parseFloat(sesion.puntaje_total),
      umbral_aprobacion: parseFloat(sesion.umbral_aprobacion),
      fecha_expiracion: sesion.fecha_expiracion,
      fecha_inicio: sesion.fecha_inicio,
      fecha_completado: sesion.fecha_completado,
      chatbot: {
        nombre: sesion.chatbot_nombre,
        nombre_asistente: sesion.nombre_asistente,
        avatar_url: sesion.avatar_url,
        mensaje_aprobado: sesion.mensaje_aprobado,
        mensaje_rechazado: sesion.mensaje_rechazado
      },
      candidato: {
        nombre: sesion.candidato_nombre,
        email: sesion.candidato_email
      }
    };

  } catch (error) {
    throw error;
  }
};

module.exports = {
  generarToken,
  calcularFechaExpiracion,
  crearSesion,
  validarSesion,
  iniciarSesion,
  calcularResultado,
  completarSesion,
  cancelarSesion,
  procesarSesionesExpiradas,
  finalizarEvaluacion,
  obtenerResumenSesion
};
