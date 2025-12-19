/**
 * EvaluatorFactory - Factory Pattern para crear evaluadores
 * Crea el evaluador correcto según el método de evaluación
 */

const ReglaFijaEvaluator = require('./ReglaFijaEvaluator');
const IAEvaluator = require('./IAEvaluator');
const ManualEvaluator = require('./ManualEvaluator');
const logger = require('../../../../config/logger');

class EvaluatorFactory {
  /**
   * Crear evaluador según el método especificado
   * @param {string} metodoEvaluacion - 'regla_fija', 'ia_opcional', 'manual'
   * @param {Object} pregunta - Objeto pregunta con configuración
   * @returns {Object} Instancia del evaluador apropiado
   */
  static crearEvaluador(metodoEvaluacion, pregunta = null) {
    switch (metodoEvaluacion) {
      case 'regla_fija':
        return new ReglaFijaEvaluator();

      case 'ia_opcional':
        // Si tiene configuración de IA y usar_ia es true, usar IA
        if (pregunta && pregunta.usar_ia) {
          return new IAEvaluator();
        }
        // Sino, usar reglas fijas
        return new ReglaFijaEvaluator();

      case 'manual':
        return new ManualEvaluator();

      default:
        // Por defecto, usar reglas fijas
        logger.warn('Método de evaluación desconocido, usando regla_fija', {
          service: 'EvaluatorFactory',
          metodoEvaluacion
        });
        return new ReglaFijaEvaluator();
    }
  }

  /**
   * Obtener nombre del método de evaluación que se usará
   * @param {string} metodoEvaluacion - Método configurado
   * @param {Object} pregunta - Pregunta
   * @returns {string} Nombre del método que se aplicará
   */
  static obtenerMetodoReal(metodoEvaluacion, pregunta = null) {
    if (metodoEvaluacion === 'ia_opcional') {
      return (pregunta && pregunta.usar_ia) ? 'ia' : 'regla_fija';
    }

    return metodoEvaluacion === 'regla_fija' ? 'regla_fija' : metodoEvaluacion;
  }
}

module.exports = EvaluatorFactory;
