/**
 * Repository: Evaluaciones de Respuestas (Knex Version)
 * Versión con Knex.js - Query Builder seguro
 */

const knex = require('../../../config/knex');

/**
 * Crear una nueva evaluación
 * @param {Object} datos - Datos de la evaluación
 * @returns {Promise<number>} ID de la evaluación creada
 */
const crear = async (datos) => {
  try {
    const evaluacionData = {
      sesion_id: datos.sesion_id,
      pregunta_id: datos.pregunta_id,
      mensaje_id: datos.mensaje_id || null,
      cumple: datos.cumple,
      puntaje: datos.puntaje || 0.00,
      razon: datos.razon || null,
      metodo_evaluacion: datos.metodo_evaluacion,
      detalles: datos.detalles ? JSON.stringify(datos.detalles) : null,
      evaluador: datos.evaluador || 'sistema'
    };

    const [id] = await knex('cb_evaluaciones').insert(evaluacionData);
    return id;
  } catch (error) {
    throw new Error(`Error al crear evaluación: ${error.message}`);
  }
};

/**
 * Obtener una evaluación por ID
 * @param {number} id - ID de la evaluación
 * @returns {Promise<Object|null>} Evaluación encontrada o null
 */
const obtenerPorId = async (id) => {
  try {
    return await knex('cb_evaluaciones')
      .where({ id })
      .first();
  } catch (error) {
    throw new Error(`Error al obtener evaluación por ID: ${error.message}`);
  }
};

/**
 * Obtener todas las evaluaciones de una sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Array>} Lista de evaluaciones
 */
const obtenerPorSesion = async (sesionId) => {
  try {
    return await knex('cb_evaluaciones as e')
      .select(
        'e.*',
        'p.pregunta',
        'p.peso',
        'p.es_eliminatoria'
      )
      .innerJoin('cb_preguntas as p', 'e.pregunta_id', 'p.id')
      .where('e.sesion_id', sesionId)
      .orderBy('e.created_at', 'asc');
  } catch (error) {
    throw new Error(`Error al obtener evaluaciones por sesión: ${error.message}`);
  }
};

/**
 * Obtener evaluación por mensaje
 * @param {number} mensajeId - ID del mensaje
 * @returns {Promise<Object|null>} Evaluación encontrada o null
 */
const obtenerPorMensaje = async (mensajeId) => {
  try {
    return await knex('cb_evaluaciones as e')
      .select(
        'e.*',
        'p.pregunta',
        'p.peso',
        'p.es_eliminatoria'
      )
      .innerJoin('cb_preguntas as p', 'e.pregunta_id', 'p.id')
      .where('e.mensaje_id', mensajeId)
      .first();
  } catch (error) {
    throw new Error(`Error al obtener evaluación por mensaje: ${error.message}`);
  }
};

/**
 * Obtener evaluación de una pregunta específica en una sesión
 * @param {number} sesionId - ID de la sesión
 * @param {number} preguntaId - ID de la pregunta
 * @returns {Promise<Object|null>} Evaluación encontrada o null
 */
const obtenerPorPregunta = async (sesionId, preguntaId) => {
  try {
    return await knex('cb_evaluaciones as e')
      .select(
        'e.*',
        'p.pregunta',
        'p.peso',
        'p.es_eliminatoria'
      )
      .innerJoin('cb_preguntas as p', 'e.pregunta_id', 'p.id')
      .where({
        'e.sesion_id': sesionId,
        'e.pregunta_id': preguntaId
      })
      .first();
  } catch (error) {
    throw new Error(`Error al obtener evaluación por pregunta: ${error.message}`);
  }
};

/**
 * Actualizar una evaluación
 * @param {number} id - ID de la evaluación
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
const actualizar = async (id, datos) => {
  try {
    const updateData = {};

    if (datos.cumple !== undefined) {
      updateData.cumple = datos.cumple;
    }

    if (datos.puntaje !== undefined) {
      updateData.puntaje = datos.puntaje;
    }

    if (datos.razon !== undefined) {
      updateData.razon = datos.razon;
    }

    if (datos.detalles !== undefined) {
      updateData.detalles = datos.detalles ? JSON.stringify(datos.detalles) : null;
    }

    if (datos.evaluador !== undefined) {
      updateData.evaluador = datos.evaluador;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    return await knex('cb_evaluaciones')
      .where({ id })
      .update(updateData);
  } catch (error) {
    throw new Error(`Error al actualizar evaluación: ${error.message}`);
  }
};

/**
 * Eliminar una evaluación
 * @param {number} id - ID de la evaluación
 * @returns {Promise<number>} Número de filas eliminadas
 */
const eliminar = async (id) => {
  try {
    return await knex('cb_evaluaciones')
      .where({ id })
      .delete();
  } catch (error) {
    throw new Error(`Error al eliminar evaluación: ${error.message}`);
  }
};

/**
 * Obtener estadísticas de evaluaciones de una sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Object>} Estadísticas de evaluación
 */
const estadisticasPorSesion = async (sesionId) => {
  try {
    const stats = await knex('cb_evaluaciones')
      .where('sesion_id', sesionId)
      .select(
        knex.raw('COUNT(*) as total_evaluaciones'),
        knex.raw('SUM(CASE WHEN cumple = 1 THEN 1 ELSE 0 END) as preguntas_aprobadas'),
        knex.raw('SUM(CASE WHEN cumple = 0 THEN 1 ELSE 0 END) as preguntas_reprobadas'),
        knex.raw('SUM(CASE WHEN cumple IS NULL THEN 1 ELSE 0 END) as preguntas_pendientes'),
        knex.raw('SUM(puntaje) as puntaje_total'),
        knex.raw('AVG(puntaje) as puntaje_promedio'),
        knex.raw('SUM(CASE WHEN metodo_evaluacion = "regla_fija" THEN 1 ELSE 0 END) as evaluadas_regla'),
        knex.raw('SUM(CASE WHEN metodo_evaluacion = "ia" THEN 1 ELSE 0 END) as evaluadas_ia'),
        knex.raw('SUM(CASE WHEN metodo_evaluacion = "manual" THEN 1 ELSE 0 END) as evaluadas_manual')
      )
      .first();

    return stats;
  } catch (error) {
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }
};

/**
 * Verificar si hay preguntas eliminatorias reprobadas
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<boolean>} true si hay eliminatorias reprobadas
 */
const tieneEliminatoriasReprobadas = async (sesionId) => {
  try {
    const resultado = await knex('cb_evaluaciones as e')
      .count('* as total')
      .innerJoin('cb_preguntas as p', 'e.pregunta_id', 'p.id')
      .where('e.sesion_id', sesionId)
      .where('p.es_eliminatoria', 1)
      .where('e.cumple', 0)
      .first();

    return resultado ? parseInt(resultado.total) > 0 : false;
  } catch (error) {
    throw new Error(`Error al verificar eliminatorias: ${error.message}`);
  }
};

/**
 * Calcular puntaje ponderado de una sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Object>} Puntaje total y máximo
 */
const calcularPuntajePonderado = async (sesionId) => {
  try {
    const resultado = await knex('cb_evaluaciones as e')
      .select(
        knex.raw('SUM(e.puntaje * p.peso) as puntaje_total'),
        knex.raw('SUM(p.peso * 100) as puntaje_maximo')
      )
      .innerJoin('cb_preguntas as p', 'e.pregunta_id', 'p.id')
      .where('e.sesion_id', sesionId)
      .first();

    return {
      puntaje_total: resultado?.puntaje_total || 0,
      puntaje_maximo: resultado?.puntaje_maximo || 0
    };
  } catch (error) {
    throw new Error(`Error al calcular puntaje ponderado: ${error.message}`);
  }
};

/**
 * Obtener evaluaciones pendientes de revisión manual
 * @param {number} configId - ID del chatbot (opcional)
 * @returns {Promise<Array>} Lista de evaluaciones pendientes
 */
const obtenerPendientes = async (configId = null) => {
  try {
    let query = knex('cb_evaluaciones as e')
      .select(
        'e.*',
        'p.pregunta',
        'p.peso',
        'p.es_eliminatoria',
        's.token as sesion_token',
        's.candidato_nombre',
        's.candidato_email',
        'c.nombre as chatbot_nombre'
      )
      .innerJoin('cb_preguntas as p', 'e.pregunta_id', 'p.id')
      .innerJoin('cb_sesiones as s', 'e.sesion_id', 's.id')
      .innerJoin('cb_config as c', 's.config_id', 'c.id')
      .whereNull('e.cumple');

    if (configId) {
      query = query.where('s.config_id', configId);
    }

    return await query.orderBy('e.created_at', 'desc');
  } catch (error) {
    throw new Error(`Error al obtener evaluaciones pendientes: ${error.message}`);
  }
};

module.exports = {
  crear,
  obtenerPorId,
  obtenerPorSesion,
  obtenerPorMensaje,
  obtenerPorPregunta,
  actualizar,
  eliminar,
  estadisticasPorSesion,
  tieneEliminatoriasReprobadas,
  calcularPuntajePonderado,
  obtenerPendientes
};
