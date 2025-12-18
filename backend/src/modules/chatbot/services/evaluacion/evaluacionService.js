/**
 * EvaluacionService - Orquestador principal de evaluaciones
 * Coordina evaluadores, scoring y persistencia
 */

const EvaluatorFactory = require('./evaluators/EvaluatorFactory');
const ScoringService = require('./scoringService');
const evaluacionesRepository = require('../../repositories/evaluacionesRepository.knex');
const preguntasRepository = require('../../repositories/preguntasRepository.knex');
const logger = require('../../../../config/logger');

class EvaluacionService {
  /**
   * Evaluar una respuesta y guardar el resultado
   * @param {Object} pregunta - Pregunta completa con configuración
   * @param {string} respuesta - Respuesta del candidato
   * @param {number} sesionId - ID de la sesión
   * @param {number} mensajeId - ID del mensaje de respuesta
   * @returns {Promise<Object>} Resultado de la evaluación
   */
  static async evaluar(pregunta, respuesta, sesionId, mensajeId) {
    try {
      logger.debug('Evaluando respuesta', {
        service: 'evaluacionService',
        preguntaId: pregunta.id,
        sesionId
      });

      // 1. Crear evaluador según método de evaluación
      const metodoEvaluacion = pregunta.metodo_evaluacion || 'regla_fija';
      const evaluador = EvaluatorFactory.crearEvaluador(metodoEvaluacion, pregunta);

      // 2. Ejecutar evaluación
      const resultadoEvaluacion = await evaluador.evaluar(pregunta, respuesta);

      // 3. Determinar método real usado (por si es ia_opcional)
      const metodoReal = EvaluatorFactory.obtenerMetodoReal(metodoEvaluacion, pregunta);

      // 4. Preparar datos para guardar
      const datosEvaluacion = {
        sesion_id: sesionId,
        mensaje_id: mensajeId,
        pregunta_id: pregunta.id,
        cumple: resultadoEvaluacion.cumple,
        puntaje: resultadoEvaluacion.puntaje,
        razon: resultadoEvaluacion.razon,
        metodo_evaluacion: metodoReal,
        peso: pregunta.peso || 1,
        es_eliminatoria: pregunta.es_eliminatoria || false,
        detalles: JSON.stringify(resultadoEvaluacion.detalles || {})
      };

      // 5. Guardar evaluación en BD
      const evaluacionId = await evaluacionesRepository.crear(datosEvaluacion);
      
      // 6. Obtener la evaluación completa
      const evaluacionGuardada = await evaluacionesRepository.obtenerPorId(evaluacionId);

      logger.info('Evaluación guardada', {
        service: 'evaluacionService',
        evaluacionId: evaluacionGuardada?.id,
        cumple: evaluacionGuardada?.cumple,
        puntaje: evaluacionGuardada?.puntaje
      });

      return {
        success: true,
        evaluacion: evaluacionGuardada,
        resultado: resultadoEvaluacion
      };

    } catch (error) {
      logger.logError(error, {
        service: 'evaluacionService',
        operacion: 'evaluar_respuesta',
        preguntaId: pregunta.id
      });
      return {
        success: false,
        error: error.message,
        evaluacion: null
      };
    }
  }

  /**
   * Calcular el puntaje total de una sesión
   * @param {number} sesionId - ID de la sesión
   * @returns {Promise<Object>} Puntaje total, máximo y porcentaje
   */
  static async calcularPuntajeSesion(sesionId) {
    try {
      logger.debug('Calculando puntaje de sesión', {
        service: 'evaluacionService',
        sesionId
      });

      // 1. Obtener todas las evaluaciones de la sesión
      const evaluaciones = await evaluacionesRepository.obtenerPorSesion(sesionId);

      if (!evaluaciones || evaluaciones.length === 0) {
        return {
          puntaje_total: 0,
          puntaje_maximo: 0,
          porcentaje: 0,
          total_preguntas: 0,
          mensaje: 'No hay evaluaciones para esta sesión'
        };
      }

      // 2. Calcular puntajes usando ScoringService
      const { puntaje_total, puntaje_maximo } = ScoringService.calcularPuntaje(evaluaciones);
      const porcentaje = ScoringService.calcularPorcentaje(puntaje_total, puntaje_maximo);

      // 3. Estadísticas adicionales
      const totalPreguntas = evaluaciones.length;
      const preguntasAprobadas = evaluaciones.filter(e => e.cumple === 1 || e.cumple === true).length;
      const preguntasReprobadas = evaluaciones.filter(e => e.cumple === 0 || e.cumple === false).length;
      const preguntasPendientes = evaluaciones.filter(e => e.cumple === null).length;

      logger.info('Puntaje calculado', {
        service: 'evaluacionService',
        puntajeTotal: puntaje_total,
        puntajeMaximo: puntaje_maximo,
        porcentaje
      });

      return {
        puntaje_total,
        puntaje_maximo,
        porcentaje,
        total_preguntas: totalPreguntas,
        preguntas_aprobadas: preguntasAprobadas,
        preguntas_reprobadas: preguntasReprobadas,
        preguntas_pendientes: preguntasPendientes
      };

    } catch (error) {
      logger.logError(error, {
        service: 'evaluacionService',
        operacion: 'calcular_puntaje',
        sesionId
      });
      throw error;
    }
  }

  /**
   * Determinar el resultado final de una sesión (aprobado/rechazado)
   * @param {number} sesionId - ID de la sesión
   * @param {number} umbralAprobacion - Umbral de aprobación (default: 70%)
   * @returns {Promise<Object>} Resultado completo con razón
   */
  static async determinarResultado(sesionId, umbralAprobacion = 70) {
    try {
      logger.debug('Determinando resultado de evaluación', {
        service: 'evaluacionService',
        sesionId,
        umbralAprobacion
      });

      // 1. Obtener todas las evaluaciones
      const evaluaciones = await evaluacionesRepository.obtenerPorSesion(sesionId);

      if (!evaluaciones || evaluaciones.length === 0) {
        return {
          resultado: 'pendiente',
          razon: 'No hay evaluaciones registradas',
          puntaje_total: 0,
          puntaje_maximo: 0,
          porcentaje: 0
        };
      }

      // 2. Verificar si hay evaluaciones pendientes (manual)
      const evaluacionesPendientes = evaluaciones.filter(e => e.cumple === null);
      if (evaluacionesPendientes.length > 0) {
        return {
          resultado: 'pendiente',
          razon: `Hay ${evaluacionesPendientes.length} pregunta(s) pendiente(s) de evaluación manual`,
          puntaje_total: 0,
          puntaje_maximo: 0,
          porcentaje: 0,
          evaluaciones_pendientes: evaluacionesPendientes.length
        };
      }

      // 3. Calcular resultado completo usando ScoringService
      const resultadoCompleto = ScoringService.calcularResultadoCompleto(evaluaciones, umbralAprobacion);

      logger.info('Resultado determinado', {
        service: 'evaluacionService',
        resultado: resultadoCompleto.resultado,
        razon: resultadoCompleto.razon
      });

      return resultadoCompleto;

    } catch (error) {
      logger.logError(error, {
        service: 'evaluacionService',
        operacion: 'determinar_resultado',
        sesionId
      });
      throw error;
    }
  }

  /**
   * Re-evaluar una pregunta específica (útil para correcciones)
   * @param {number} evaluacionId - ID de la evaluación existente
   * @returns {Promise<Object>} Nueva evaluación
   */
  static async reevaluar(evaluacionId) {
    try {
      logger.info('Re-evaluando evaluación', {
        service: 'evaluacionService',
        evaluacionId
      });

      // 1. Obtener evaluación existente
      const evaluaciones = await evaluacionesRepository.obtenerPorSesion(evaluacionId);
      if (!evaluaciones || evaluaciones.length === 0) {
        throw new Error('Evaluación no encontrada');
      }

      const evaluacion = evaluaciones[0];

      // 2. Obtener pregunta y respuesta original
      const pregunta = await preguntasRepository.obtenerPorId(evaluacion.pregunta_id);
      // Nota: La respuesta debería estar en mensaje.contenido del mensaje asociado
      // Por ahora asumimos que está disponible en el contexto

      // 3. Volver a evaluar
      // TODO: Necesitaríamos obtener la respuesta original del mensaje
      logger.warn('Re-evaluación requiere respuesta original del mensaje', {
        service: 'evaluacionService'
      });

      return {
        success: false,
        mensaje: 'Re-evaluación no implementada completamente - necesita integración con mensajes'
      };

    } catch (error) {
      logger.logError(error, {
        service: 'evaluacionService',
        operacion: 're_evaluar',
        evaluacionId
      });
      throw error;
    }
  }

  /**
   * Obtener estadísticas de evaluación por método
   * @param {number} sesionId - ID de la sesión
   * @returns {Promise<Object>} Distribución de evaluaciones
   */
  static async obtenerEstadisticasPorMetodo(sesionId) {
    try {
      const evaluaciones = await evaluacionesRepository.obtenerPorSesion(sesionId);

      if (!evaluaciones || evaluaciones.length === 0) {
        return {
          regla_fija: { count: 0, puntaje_promedio: 0 },
          ia: { count: 0, puntaje_promedio: 0 },
          manual: { count: 0, puntaje_promedio: 0 }
        };
      }

      return ScoringService.distribucionPorMetodo(evaluaciones);

    } catch (error) {
      logger.logError(error, {
        service: 'evaluacionService',
        operacion: 'obtener_estadisticas',
        sesionId
      });
      throw error;
    }
  }

  /**
   * Validar si una sesión puede ser finalizada
   * @param {number} sesionId - ID de la sesión
   * @returns {Promise<Object>} Estado de validación
   */
  static async validarFinalizacion(sesionId) {
    try {
      // Obtener todas las evaluaciones
      const evaluaciones = await evaluacionesRepository.obtenerPorSesion(sesionId);
      
      if (!evaluaciones || evaluaciones.length === 0) {
        return {
          puede_finalizar: false,
          razon: 'No hay evaluaciones registradas',
          estadisticas: { total_evaluaciones: 0, preguntas_pendientes: 0 }
        };
      }

      // Verificar que todas las evaluaciones tengan un resultado (cumple no sea null)
      const evaluacionesPendientes = evaluaciones.filter(e => e.cumple === null);
      const todasEvaluadas = evaluacionesPendientes.length === 0;

      return {
        puede_finalizar: todasEvaluadas,
        razon: todasEvaluadas
          ? 'Todas las preguntas han sido evaluadas'
          : `Faltan ${evaluacionesPendientes.length} pregunta(s) por evaluar`,
        estadisticas: {
          total_evaluaciones: evaluaciones.length,
          preguntas_pendientes: evaluacionesPendientes.length
        }
      };

    } catch (error) {
      logger.logError(error, {
        service: 'evaluacionService',
        operacion: 'validar_finalizacion',
        sesionId
      });
      throw error;
    }
  }
}

module.exports = EvaluacionService;
