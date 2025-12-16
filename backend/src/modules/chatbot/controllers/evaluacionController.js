/**
 * EvaluacionController - Controlador de evaluaciones
 * Endpoints para consultar y gestionar evaluaciones
 */

const evaluacionService = require('../services/evaluacion/evaluacionService');
const evaluacionesRepository = require('../repositories/evaluacionesRepository.knex');

const evaluacionController = {
  /**
   * GET /api/sesiones/:sesionId/evaluaciones
   * Obtener todas las evaluaciones de una sesión
   */
  obtenerEvaluaciones: async (req, res, next) => {
    try {
      const { sesionId } = req.params;

      const evaluaciones = await evaluacionesRepository.obtenerPorSesion(sesionId);

      res.json({
        success: true,
        data: evaluaciones,
        total: evaluaciones.length
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sesiones/:sesionId/evaluaciones/pregunta/:preguntaId
   * Obtener evaluación de una pregunta específica
   */
  obtenerEvaluacionPregunta: async (req, res, next) => {
    try {
      const { sesionId, preguntaId } = req.params;

      const evaluacion = await evaluacionesRepository.obtenerPorPregunta(sesionId, preguntaId);

      if (!evaluacion) {
        return res.status(404).json({
          success: false,
          message: 'Evaluación no encontrada'
        });
      }

      res.json({
        success: true,
        data: evaluacion
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sesiones/:sesionId/evaluaciones/puntaje
   * Calcular puntaje total de la sesión
   */
  calcularPuntaje: async (req, res, next) => {
    try {
      const { sesionId } = req.params;

      const puntaje = await evaluacionService.calcularPuntajeSesion(sesionId);

      res.json({
        success: true,
        data: puntaje
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sesiones/:sesionId/evaluaciones/resultado
   * Determinar resultado final (aprobado/rechazado)
   */
  determinarResultado: async (req, res, next) => {
    try {
      const { sesionId } = req.params;
      const { umbral } = req.query; // Opcional: ?umbral=70

      const umbralAprobacion = umbral ? parseFloat(umbral) : 70;

      const resultado = await evaluacionService.determinarResultado(sesionId, umbralAprobacion);

      res.json({
        success: true,
        data: resultado
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sesiones/:sesionId/evaluaciones/estadisticas
   * Obtener estadísticas completas de evaluación
   */
  obtenerEstadisticas: async (req, res, next) => {
    try {
      const { sesionId } = req.params;

      // Estadísticas generales
      const estadisticas = await evaluacionesRepository.estadisticasPorSesion(sesionId);

      // Estadísticas por método
      const porMetodo = await evaluacionService.obtenerEstadisticasPorMetodo(sesionId);

      // Puntaje calculado
      const puntaje = await evaluacionService.calcularPuntajeSesion(sesionId);

      // Verificar eliminatorias
      const eliminatoriasReprobadas = await evaluacionesRepository.tieneEliminatoriasReprobadas(sesionId);

      res.json({
        success: true,
        data: {
          ...estadisticas,
          puntaje,
          distribucion_por_metodo: porMetodo,
          eliminatorias_reprobadas
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * PUT /api/evaluaciones/:evaluacionId/manual
   * Actualizar evaluación manual (para preguntas de tipo manual)
   */
  actualizarEvaluacionManual: async (req, res, next) => {
    try {
      const { evaluacionId } = req.params;
      const { cumple, puntaje, razon, evaluador } = req.body;

      // Validaciones
      if (cumple === undefined || cumple === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "cumple" es requerido (true/false)'
        });
      }

      if (puntaje === undefined || puntaje === null) {
        return res.status(400).json({
          success: false,
          message: 'El campo "puntaje" es requerido (0-100)'
        });
      }

      if (puntaje < 0 || puntaje > 100) {
        return res.status(400).json({
          success: false,
          message: 'El puntaje debe estar entre 0 y 100'
        });
      }

      // Preparar detalles de evaluación manual
      const detalles = {
        evaluador: evaluador || 'Sistema',
        fecha_evaluacion: new Date().toISOString(),
        estado: 'evaluado'
      };

      // Actualizar en base de datos
      const resultado = await evaluacionesRepository.actualizar(evaluacionId, {
        cumple: cumple ? 1 : 0,
        puntaje,
        razon: razon || 'Evaluación manual completada',
        detalles: JSON.stringify(detalles)
      });

      res.json({
        success: true,
        message: 'Evaluación manual actualizada correctamente',
        data: resultado
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sesiones/:sesionId/evaluaciones/validar-finalizacion
   * Validar si la sesión puede ser finalizada
   */
  validarFinalizacion: async (req, res, next) => {
    try {
      const { sesionId } = req.params;

      const validacion = await evaluacionService.validarFinalizacion(sesionId);

      res.json({
        success: true,
        data: validacion
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/sesiones/:sesionId/evaluaciones/mensaje/:mensajeId
   * Obtener evaluación de un mensaje específico
   */
  obtenerEvaluacionPorMensaje: async (req, res, next) => {
    try {
      const { mensajeId } = req.params;

      const evaluacion = await evaluacionesRepository.obtenerPorMensaje(mensajeId);

      if (!evaluacion) {
        return res.status(404).json({
          success: false,
          message: 'No se encontró evaluación para este mensaje'
        });
      }

      res.json({
        success: true,
        data: evaluacion
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * GET /api/evaluaciones/pendientes
   * Obtener todas las evaluaciones pendientes de revisión manual
   */
  obtenerPendientes: async (req, res, next) => {
    try {
      const { configId } = req.query;

      // TODO: Implementar filtro por config_id si se necesita
      // Por ahora retornamos todas las pendientes del sistema

      const evaluaciones = await evaluacionesRepository.obtenerPendientes(configId);

      res.json({
        success: true,
        data: evaluaciones,
        total: evaluaciones.length
      });

    } catch (error) {
      next(error);
    }
  }
};

module.exports = evaluacionController;
