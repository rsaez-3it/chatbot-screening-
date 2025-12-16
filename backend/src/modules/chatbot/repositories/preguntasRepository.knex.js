/**
 * Repository: Preguntas de Chatbot (Knex Version)
 * Versión con Knex.js - Query Builder seguro
 */

const knex = require('../../../config/knex');

/**
 * Obtener todas las preguntas de un chatbot
 * @param {number} configId - ID del chatbot
 * @param {boolean} soloActivas - Si true, solo retorna preguntas activas
 * @returns {Promise<Array>} Lista de preguntas
 */
const obtenerPorConfig = async (configId, soloActivas = false) => {
  try {
    let query = knex('cb_preguntas')
      .where('config_id', configId);

    if (soloActivas) {
      query = query.where('activa', 1);
    }

    return await query.orderBy([
      { column: 'orden', order: 'asc' },
      { column: 'id', order: 'asc' }
    ]);
  } catch (error) {
    throw new Error(`Error al obtener preguntas: ${error.message}`);
  }
};

/**
 * Obtener una pregunta por ID
 * @param {number} id - ID de la pregunta
 * @returns {Promise<Object|null>} Pregunta encontrada o null
 */
const obtenerPorId = async (id) => {
  try {
    return await knex('cb_preguntas')
      .where({ id })
      .first();
  } catch (error) {
    throw new Error(`Error al obtener pregunta por ID: ${error.message}`);
  }
};

/**
 * Crear una nueva pregunta
 * @param {Object} datos - Datos de la pregunta
 * @returns {Promise<number>} ID de la pregunta creada
 */
const crear = async (datos) => {
  try {
    const preguntaData = {
      config_id: datos.config_id,
      pregunta: datos.pregunta,
      descripcion: datos.descripcion || null,
      media_url: datos.media_url || null,
      tipo_campo: datos.tipo_campo || 'texto',
      opciones: datos.opciones ? JSON.stringify(datos.opciones) : null,
      requerida: datos.requerida !== undefined ? datos.requerida : true,
      min_longitud: datos.min_longitud || null,
      max_longitud: datos.max_longitud || null,
      patron_validacion: datos.patron_validacion || null,
      metodo_evaluacion: datos.metodo_evaluacion || 'regla_fija',
      regla: datos.regla ? JSON.stringify(datos.regla) : null,
      usar_ia: datos.usar_ia !== undefined ? datos.usar_ia : false,
      prompt_ia: datos.prompt_ia || null,
      criterios_ia: datos.criterios_ia ? JSON.stringify(datos.criterios_ia) : null,
      es_eliminatoria: datos.es_eliminatoria !== undefined ? datos.es_eliminatoria : false,
      peso: datos.peso || 1.00,
      orden: datos.orden || 0,
      activa: datos.activa !== undefined ? datos.activa : true
    };

    const [id] = await knex('cb_preguntas').insert(preguntaData);
    return id;
  } catch (error) {
    throw new Error(`Error al crear pregunta: ${error.message}`);
  }
};

/**
 * Actualizar una pregunta
 * @param {number} id - ID de la pregunta
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
const actualizar = async (id, datos) => {
  try {
    const updateData = {};

    const camposPermitidos = [
      'pregunta', 'descripcion', 'media_url', 'tipo_campo', 'opciones',
      'requerida', 'min_longitud', 'max_longitud', 'patron_validacion',
      'metodo_evaluacion', 'regla', 'usar_ia', 'prompt_ia', 'criterios_ia',
      'es_eliminatoria', 'peso', 'orden', 'activa'
    ];

    camposPermitidos.forEach(campo => {
      if (datos.hasOwnProperty(campo)) {
        // Campos que son JSON
        if (['opciones', 'regla', 'criterios_ia'].includes(campo) && datos[campo]) {
          updateData[campo] = JSON.stringify(datos[campo]);
        } else {
          updateData[campo] = datos[campo];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    return await knex('cb_preguntas')
      .where({ id })
      .update(updateData);
  } catch (error) {
    throw new Error(`Error al actualizar pregunta: ${error.message}`);
  }
};

/**
 * Eliminar una pregunta
 * @param {number} id - ID de la pregunta
 * @returns {Promise<number>} Número de filas eliminadas
 */
const eliminar = async (id) => {
  try {
    return await knex('cb_preguntas')
      .where({ id })
      .delete();
  } catch (error) {
    throw new Error(`Error al eliminar pregunta: ${error.message}`);
  }
};

/**
 * Desactivar una pregunta
 * @param {number} id - ID de la pregunta
 * @returns {Promise<number>} Número de filas afectadas
 */
const desactivar = async (id) => {
  try {
    return await knex('cb_preguntas')
      .where({ id })
      .update({ activa: false });
  } catch (error) {
    throw new Error(`Error al desactivar pregunta: ${error.message}`);
  }
};

/**
 * Reordenar preguntas
 * @param {number} configId - ID del chatbot
 * @param {Array<number>} ordenIds - Array de IDs en el orden deseado
 * @returns {Promise<void>}
 */
const reordenar = async (configId, ordenIds) => {
  try {
    // Actualizar orden de cada pregunta
    const promises = ordenIds.map((id, index) => {
      return knex('cb_preguntas')
        .where({ id, config_id: configId })
        .update({ orden: index });
    });

    await Promise.all(promises);
  } catch (error) {
    throw new Error(`Error al reordenar preguntas: ${error.message}`);
  }
};

/**
 * Contar preguntas de un chatbot
 * @param {number} configId - ID del chatbot
 * @param {boolean} soloActivas - Si true, solo cuenta activas
 * @returns {Promise<number>} Total de preguntas
 */
const contar = async (configId, soloActivas = false) => {
  try {
    let query = knex('cb_preguntas')
      .count('* as total')
      .where('config_id', configId);

    if (soloActivas) {
      query = query.where('activa', 1);
    }

    const resultado = await query.first();
    return parseInt(resultado.total);
  } catch (error) {
    throw new Error(`Error al contar preguntas: ${error.message}`);
  }
};

/**
 * Obtener preguntas eliminatorias de un chatbot
 * @param {number} configId - ID del chatbot
 * @returns {Promise<Array>} Lista de preguntas eliminatorias
 */
const obtenerEliminatorias = async (configId) => {
  try {
    return await knex('cb_preguntas')
      .where({
        config_id: configId,
        es_eliminatoria: 1,
        activa: 1
      })
      .orderBy('orden', 'asc');
  } catch (error) {
    throw new Error(`Error al obtener preguntas eliminatorias: ${error.message}`);
  }
};

module.exports = {
  obtenerPorConfig,
  obtenerPorId,
  crear,
  actualizar,
  eliminar,
  desactivar,
  reordenar,
  contar,
  obtenerEliminatorias
};
