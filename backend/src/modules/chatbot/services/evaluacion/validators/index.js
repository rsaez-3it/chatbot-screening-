/**
 * Validators: Validadores de reglas para evaluación
 * Cada validador implementa una lógica específica de validación
 */

/**
 * RangoValidator - Valida rangos numéricos (mayor que, menor que, entre)
 */
class RangoValidator {
  /**
   * @param {Object} regla - { operador: '>=', valor: 2 } o { min: 1, max: 10 }
   * @param {string|number} respuesta - Respuesta del candidato
   */
  static validar(regla, respuesta) {
    const numero = parseFloat(respuesta);

    if (isNaN(numero)) {
      return {
        cumple: false,
        razon: 'La respuesta no es un número válido',
        puntaje: 0
      };
    }

    // Operador (>=, >, <=, <, ==)
    if (regla.operador && regla.valor !== undefined) {
      let cumple = false;

      switch (regla.operador) {
        case '>=':
          cumple = numero >= regla.valor;
          break;
        case '>':
          cumple = numero > regla.valor;
          break;
        case '<=':
          cumple = numero <= regla.valor;
          break;
        case '<':
          cumple = numero < regla.valor;
          break;
        case '==':
        case '=':
          cumple = numero === regla.valor;
          break;
        default:
          return {
            cumple: false,
            razon: `Operador no válido: ${regla.operador}`,
            puntaje: 0
          };
      }

      return {
        cumple,
        razon: cumple ? `Número ${numero} cumple ${regla.operador} ${regla.valor}` : `Número ${numero} no cumple ${regla.operador} ${regla.valor}`,
        puntaje: cumple ? 100 : 0
      };
    }

    // Rango (min-max)
    if (regla.min !== undefined && regla.max !== undefined) {
      const cumple = numero >= regla.min && numero <= regla.max;
      return {
        cumple,
        razon: cumple ? `Número ${numero} está en rango [${regla.min}, ${regla.max}]` : `Número ${numero} fuera de rango [${regla.min}, ${regla.max}]`,
        puntaje: cumple ? 100 : 0
      };
    }

    // Solo min (sin max)
    if (regla.min !== undefined && regla.max === undefined) {
      const cumple = numero >= regla.min;
      return {
        cumple,
        razon: cumple ? `Número ${numero} es mayor o igual a ${regla.min}` : `Número ${numero} es menor a ${regla.min}`,
        puntaje: cumple ? 100 : 0
      };
    }

    // Solo max (sin min)
    if (regla.max !== undefined && regla.min === undefined) {
      const cumple = numero <= regla.max;
      return {
        cumple,
        razon: cumple ? `Número ${numero} es menor o igual a ${regla.max}` : `Número ${numero} es mayor a ${regla.max}`,
        puntaje: cumple ? 100 : 0
      };
    }

    return {
      cumple: false,
      razon: 'Regla de rango no válida',
      puntaje: 0
    };
  }
}

/**
 * KeywordValidator - Valida presencia de palabras clave
 */
class KeywordValidator {
  /**
   * @param {Object} regla - { keywords: ['node', 'express'], modo: 'todas'|'alguna' }
   * @param {string} respuesta - Respuesta del candidato
   */
  static validar(regla, respuesta) {
    if (!regla.keywords || !Array.isArray(regla.keywords)) {
      return {
        cumple: false,
        razon: 'No se especificaron palabras clave',
        puntaje: 0
      };
    }

    const respuestaLower = respuesta.toLowerCase();
    const modo = regla.modo || 'alguna'; // 'todas' o 'alguna'

    const keywordsEncontradas = regla.keywords.filter(keyword =>
      respuestaLower.includes(keyword.toLowerCase())
    );

    let cumple = false;

    if (modo === 'todas') {
      cumple = keywordsEncontradas.length === regla.keywords.length;
    } else {
      cumple = keywordsEncontradas.length > 0;
    }

    const puntaje = cumple ? 100 : (keywordsEncontradas.length / regla.keywords.length) * 100;

    return {
      cumple,
      razon: cumple
        ? `Palabras clave encontradas: ${keywordsEncontradas.join(', ')}`
        : `Faltan palabras clave: ${regla.keywords.filter(k => !keywordsEncontradas.includes(k)).join(', ')}`,
      puntaje: Math.round(puntaje),
      detalles: {
        encontradas: keywordsEncontradas,
        total: regla.keywords.length
      }
    };
  }
}

/**
 * OpcionValidator - Valida opciones de selección (única o múltiple)
 */
class OpcionValidator {
  /**
   * @param {Object} regla - { opciones_validas: ['si'], tipo: 'unica'|'multiple' }
   * @param {string|Array} respuesta - Respuesta del candidato
   */
  static validar(regla, respuesta) {
    if (!regla.opciones_validas || !Array.isArray(regla.opciones_validas)) {
      return {
        cumple: false,
        razon: 'No se especificaron opciones válidas',
        puntaje: 0
      };
    }

    const tipo = regla.tipo || 'unica';

    // Normalizar respuesta a array
    let respuestas = Array.isArray(respuesta) ? respuesta : [respuesta];

    // Normalizar a lowercase para comparación
    const opcionesValidas = regla.opciones_validas.map(o => o.toString().toLowerCase());
    respuestas = respuestas.map(r => r.toString().toLowerCase());

    if (tipo === 'unica') {
      const cumple = respuestas.length === 1 && opcionesValidas.includes(respuestas[0]);
      return {
        cumple,
        razon: cumple
          ? `Opción "${respuestas[0]}" es válida`
          : `Opción "${respuestas[0]}" no es válida. Esperado: ${regla.opciones_validas.join(', ')}`,
        puntaje: cumple ? 100 : 0
      };
    }

    // Múltiple
    const respuestasValidas = respuestas.filter(r => opcionesValidas.includes(r));
    const cumple = respuestasValidas.length > 0;
    const puntaje = (respuestasValidas.length / respuestas.length) * 100;

    return {
      cumple,
      razon: cumple
        ? `${respuestasValidas.length} de ${respuestas.length} opciones son válidas`
        : 'Ninguna opción válida seleccionada',
      puntaje: Math.round(puntaje),
      detalles: {
        validas: respuestasValidas,
        total: respuestas.length
      }
    };
  }
}

/**
 * FormatoValidator - Valida formatos específicos (email, teléfono, URL)
 */
class FormatoValidator {
  /**
   * @param {Object} regla - { formato: 'email'|'telefono'|'url' }
   * @param {string} respuesta - Respuesta del candidato
   */
  static validar(regla, respuesta) {
    const formato = regla.formato;

    let regex;
    let nombreFormato;

    switch (formato) {
      case 'email':
        regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        nombreFormato = 'email';
        break;

      case 'telefono':
        regex = /^[\d\s\-\+\(\)]{7,20}$/;
        nombreFormato = 'teléfono';
        break;

      case 'url':
        regex = /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/;
        nombreFormato = 'URL';
        break;

      default:
        return {
          cumple: false,
          razon: `Formato desconocido: ${formato}`,
          puntaje: 0
        };
    }

    const cumple = regex.test(respuesta);

    return {
      cumple,
      razon: cumple
        ? `Formato de ${nombreFormato} válido`
        : `Formato de ${nombreFormato} inválido`,
      puntaje: cumple ? 100 : 0
    };
  }
}

/**
 * LongitudValidator - Valida longitud de texto
 */
class LongitudValidator {
  /**
   * @param {Object} regla - { min: 10, max: 500 }
   * @param {string} respuesta - Respuesta del candidato
   */
  static validar(regla, respuesta) {
    const longitud = respuesta.length;

    if (regla.min !== undefined && longitud < regla.min) {
      return {
        cumple: false,
        razon: `Texto muy corto (${longitud} caracteres). Mínimo: ${regla.min}`,
        puntaje: Math.round((longitud / regla.min) * 100)
      };
    }

    if (regla.max !== undefined && longitud > regla.max) {
      return {
        cumple: false,
        razon: `Texto muy largo (${longitud} caracteres). Máximo: ${regla.max}`,
        puntaje: 50 // Penalización por exceder
      };
    }

    return {
      cumple: true,
      razon: `Longitud válida (${longitud} caracteres)`,
      puntaje: 100
    };
  }
}

/**
 * IgualValidator - Valida igualdad exacta
 */
class IgualValidator {
  /**
   * @param {Object} regla - { valor: 'si' } o { respuesta_correcta: 'si' }
   * @param {string} respuesta - Respuesta del candidato
   */
  static validar(regla, respuesta) {
    // Soportar tanto 'valor' como 'respuesta_correcta'
    const valorEsperado = regla.valor || regla.respuesta_correcta;
    
    if (!valorEsperado) {
      return {
        cumple: false,
        razon: 'No se especificó valor esperado en la regla',
        puntaje: 0
      };
    }

    const cumple = respuesta.toString().toLowerCase() === valorEsperado.toString().toLowerCase();

    return {
      cumple,
      razon: cumple
        ? `Respuesta correcta: "${respuesta}"`
        : `Respuesta incorrecta. Esperado: "${valorEsperado}"`,
      puntaje: cumple ? 100 : 0
    };
  }
}

/**
 * ContieneValidator - Valida que contenga ciertos valores
 */
class ContieneValidator {
  /**
   * @param {Object} regla - { valores_requeridos: ['MySQL', 'PostgreSQL'] }
   * @param {string|Array} respuesta - Respuesta del candidato
   */
  static validar(regla, respuesta) {
    if (!regla.valores_requeridos || !Array.isArray(regla.valores_requeridos)) {
      return {
        cumple: false,
        razon: 'No se especificaron valores requeridos',
        puntaje: 0
      };
    }

    // Convertir respuesta a array si es string
    let respuestas = Array.isArray(respuesta) ? respuesta : [respuesta];

    const valoresEncontrados = regla.valores_requeridos.filter(valor =>
      respuestas.some(r => r.toLowerCase().includes(valor.toLowerCase()))
    );

    const cumple = valoresEncontrados.length === regla.valores_requeridos.length;
    const puntaje = (valoresEncontrados.length / regla.valores_requeridos.length) * 100;

    return {
      cumple,
      razon: cumple
        ? `Todos los valores encontrados: ${valoresEncontrados.join(', ')}`
        : `Faltan valores: ${regla.valores_requeridos.filter(v => !valoresEncontrados.includes(v)).join(', ')}`,
      puntaje: Math.round(puntaje),
      detalles: {
        encontrados: valoresEncontrados,
        total: regla.valores_requeridos.length
      }
    };
  }
}

module.exports = {
  RangoValidator,
  KeywordValidator,
  OpcionValidator,
  FormatoValidator,
  LongitudValidator,
  IgualValidator,
  ContieneValidator
};
