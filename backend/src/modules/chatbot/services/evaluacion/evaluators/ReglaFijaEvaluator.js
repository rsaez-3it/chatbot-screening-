/**
 * ReglaFijaEvaluator - Evaluador basado en reglas fijas
 * Evalúa respuestas según reglas predefinidas (80% del sistema)
 */

const validators = require('../validators');

class ReglaFijaEvaluator {
  /**
   * Evaluar una respuesta según reglas fijas
   * @param {Object} pregunta - Objeto con la pregunta y sus reglas
   * @param {string} respuesta - Respuesta del candidato
   * @returns {Promise<Object>} Resultado de la evaluación
   */
  async evaluar(pregunta, respuesta) {
    try {
      // Verificar que haya reglas definidas
      if (!pregunta.regla) {
        return {
          cumple: false,
          puntaje: 0,
          razon: 'No hay reglas definidas para esta pregunta',
          metodo_evaluacion: 'regla_fija',
          detalles: { error: 'Sin reglas' }
        };
      }

      // Parsear regla si es string
      const regla = typeof pregunta.regla === 'string'
        ? JSON.parse(pregunta.regla)
        : pregunta.regla;

      // Determinar qué validador usar según el tipo de campo de la pregunta
      // Esto es más confiable que el tipo de regla
      let resultado;
      const tipoCampo = pregunta.tipo_campo;

      // Priorizar el tipo de campo sobre el tipo de regla
      if (tipoCampo === 'numero') {
        // Para preguntas numéricas, usar RangoValidator
        resultado = validators.RangoValidator.validar(regla, respuesta);
      } else if (tipoCampo === 'si_no') {
        // Para preguntas sí/no, usar IgualValidator
        resultado = validators.IgualValidator.validar(regla, respuesta);
      } else if (tipoCampo === 'texto' || tipoCampo === 'texto_corto' || tipoCampo === 'texto_largo') {
        // Para preguntas de texto, verificar si tiene keywords
        if (regla.keywords && Array.isArray(regla.keywords) && regla.keywords.length > 0) {
          resultado = validators.KeywordValidator.validar(regla, respuesta);
        } else {
          // Si no tiene keywords, usar validación de longitud o formato
          resultado = validators.LongitudValidator.validar(regla, respuesta);
        }
      } else if (tipoCampo === 'opcion_unica' || tipoCampo === 'opcion_multiple') {
        resultado = validators.OpcionValidator.validar(regla, respuesta);
      } else if (tipoCampo === 'email') {
        resultado = validators.FormatoValidator.validar({ formato: 'email' }, respuesta);
      } else if (tipoCampo === 'telefono') {
        resultado = validators.FormatoValidator.validar({ formato: 'telefono' }, respuesta);
      } else {
        // Fallback: usar el tipo de regla
        switch (regla.tipo) {
          case 'numero':
          case 'rango':
            resultado = validators.RangoValidator.validar(regla, respuesta);
            break;

          case 'keywords':
          case 'palabras_clave':
            resultado = validators.KeywordValidator.validar(regla, respuesta);
            break;

          case 'opcion':
          case 'opciones':
            resultado = validators.OpcionValidator.validar(regla, respuesta);
            break;

          case 'formato':
            resultado = validators.FormatoValidator.validar(regla, respuesta);
            break;

          case 'longitud':
            resultado = validators.LongitudValidator.validar(regla, respuesta);
            break;

          case 'igual':
          case 'igual_a':
          case 'igualdad':
            resultado = validators.IgualValidator.validar(regla, respuesta);
            break;

          case 'contiene':
            resultado = validators.ContieneValidator.validar(regla, respuesta);
            break;

          default:
            return {
              cumple: false,
              puntaje: 0,
              razon: `Tipo de regla desconocido: ${regla.tipo}`,
              metodo_evaluacion: 'regla_fija',
              detalles: { error: 'Tipo de regla no soportado' }
            };
        }
      }

      // Agregar información adicional
      return {
        cumple: resultado.cumple,
        puntaje: resultado.puntaje,
        razon: resultado.razon,
        metodo_evaluacion: 'regla_fija',
        detalles: {
          tipo_regla: regla.tipo,
          regla_aplicada: regla,
          respuesta_evaluada: respuesta,
          ...resultado.detalles
        }
      };

    } catch (error) {
      return {
        cumple: false,
        puntaje: 0,
        razon: `Error al evaluar: ${error.message}`,
        metodo_evaluacion: 'regla_fija',
        detalles: { error: error.message }
      };
    }
  }

  /**
   * Validar que las reglas de una pregunta sean correctas
   * @param {Object} pregunta - Pregunta a validar
   * @returns {Object} Resultado de la validación
   */
  validarReglas(pregunta) {
    if (!pregunta.regla) {
      return {
        valido: false,
        errores: ['No se definieron reglas para la pregunta']
      };
    }

    try {
      const regla = typeof pregunta.regla === 'string'
        ? JSON.parse(pregunta.regla)
        : pregunta.regla;

      const errores = [];

      if (!regla.tipo) {
        errores.push('La regla debe tener un tipo definido');
      }

      // Validaciones específicas según tipo
      switch (regla.tipo) {
        case 'numero':
        case 'rango':
          if (!regla.operador && (regla.min === undefined || regla.max === undefined)) {
            errores.push('Regla de número debe tener operador+valor o min+max');
          }
          break;

        case 'keywords':
        case 'palabras_clave':
          if (!regla.keywords || !Array.isArray(regla.keywords)) {
            errores.push('Regla de keywords debe tener un array de palabras clave');
          }
          break;

        case 'opcion':
        case 'opciones':
          if (!regla.opciones_validas || !Array.isArray(regla.opciones_validas)) {
            errores.push('Regla de opciones debe tener opciones_validas');
          }
          break;

        case 'formato':
          if (!regla.formato) {
            errores.push('Regla de formato debe especificar el formato');
          }
          break;
      }

      return {
        valido: errores.length === 0,
        errores
      };

    } catch (error) {
      return {
        valido: false,
        errores: [`Error al parsear regla: ${error.message}`]
      };
    }
  }
}

module.exports = ReglaFijaEvaluator;
