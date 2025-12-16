/**
 * Repository: Mensajes de Conversación (Knex Version)
 * Versión con Knex.js - Query Builder seguro
 */

const knex = require('../../../config/knex');

/**
 * Crear un nuevo mensaje
 * @param {Object} datos - Datos del mensaje
 * @returns {Promise<number>} ID del mensaje creado
 */
const crear = async (datos) => {
  try {
    const mensajeData = {
      sesion_id: datos.sesion_id,
      pregunta_id: datos.pregunta_id || null,
      tipo: datos.tipo,
      contenido: datos.contenido,
      metadata: datos.metadata ? JSON.stringify(datos.metadata) : null
    };

    const [id] = await knex('cb_mensajes').insert(mensajeData);
    return id;
  } catch (error) {
    throw new Error(`Error al crear mensaje: ${error.message}`);
  }
};

/**
 * Obtener un mensaje por ID
 * @param {number} id - ID del mensaje
 * @returns {Promise<Object|null>} Mensaje encontrado o null
 */
const obtenerPorId = async (id) => {
  try {
    return await knex('cb_mensajes')
      .where({ id })
      .first();
  } catch (error) {
    throw new Error(`Error al obtener mensaje por ID: ${error.message}`);
  }
};

/**
 * Obtener todos los mensajes de una sesión
 * @param {number} sesionId - ID de la sesión
 * @param {Object} filtros - Filtros opcionales (tipo)
 * @returns {Promise<Array>} Lista de mensajes
 */
const obtenerPorSesion = async (sesionId, filtros = {}) => {
  try {
    let query = knex('cb_mensajes')
      .where('sesion_id', sesionId);

    if (filtros.tipo) {
      query = query.where('tipo', filtros.tipo);
    }

    return await query.orderBy('created_at', 'asc');
  } catch (error) {
    throw new Error(`Error al obtener mensajes por sesión: ${error.message}`);
  }
};

/**
 * Obtener solo las preguntas de una sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Array>} Lista de preguntas
 */
const obtenerPreguntasSesion = async (sesionId) => {
  try {
    return await knex('cb_mensajes as m')
      .select(
        'm.*',
        'p.pregunta as texto_pregunta',
        'p.tipo_campo'
      )
      .leftJoin('cb_preguntas as p', 'm.pregunta_id', 'p.id')
      .where('m.sesion_id', sesionId)
      .where('m.tipo', 'pregunta')
      .orderBy('m.created_at', 'asc');
  } catch (error) {
    throw new Error(`Error al obtener preguntas de sesión: ${error.message}`);
  }
};

/**
 * Obtener solo las respuestas de una sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Array>} Lista de respuestas
 */
const obtenerRespuestasSesion = async (sesionId) => {
  try {
    return await knex('cb_mensajes as m')
      .select(
        'm.*',
        'p.pregunta as texto_pregunta'
      )
      .leftJoin('cb_preguntas as p', 'm.pregunta_id', 'p.id')
      .where('m.sesion_id', sesionId)
      .where('m.tipo', 'respuesta')
      .orderBy('m.created_at', 'asc');
  } catch (error) {
    throw new Error(`Error al obtener respuestas de sesión: ${error.message}`);
  }
};

/**
 * Obtener conversación completa con detalles
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Array>} Conversación completa
 */
const obtenerConversacionCompleta = async (sesionId) => {
  try {
    return await knex('cb_mensajes as m')
      .select(
        'm.*',
        'p.pregunta as texto_pregunta',
        'p.tipo_campo',
        'p.descripcion as descripcion_pregunta',
        'p.media_url'
      )
      .leftJoin('cb_preguntas as p', 'm.pregunta_id', 'p.id')
      .where('m.sesion_id', sesionId)
      .orderBy('m.created_at', 'asc');
  } catch (error) {
    throw new Error(`Error al obtener conversación completa: ${error.message}`);
  }
};

/**
 * Actualizar un mensaje
 * @param {number} id - ID del mensaje
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
const actualizar = async (id, datos) => {
  try {
    const updateData = {};

    if (datos.contenido !== undefined) {
      updateData.contenido = datos.contenido;
    }

    if (datos.metadata !== undefined) {
      updateData.metadata = datos.metadata ? JSON.stringify(datos.metadata) : null;
    }

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    return await knex('cb_mensajes')
      .where({ id })
      .update(updateData);
  } catch (error) {
    throw new Error(`Error al actualizar mensaje: ${error.message}`);
  }
};

/**
 * Eliminar un mensaje
 * @param {number} id - ID del mensaje
 * @returns {Promise<number>} Número de filas eliminadas
 */
const eliminar = async (id) => {
  try {
    return await knex('cb_mensajes')
      .where({ id })
      .delete();
  } catch (error) {
    throw new Error(`Error al eliminar mensaje: ${error.message}`);
  }
};

/**
 * Contar mensajes de una sesión por tipo
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<Object>} Conteo por tipo
 */
const contarPorTipo = async (sesionId) => {
  try {
    const resultados = await knex('cb_mensajes')
      .select('tipo')
      .count('* as total')
      .where('sesion_id', sesionId)
      .groupBy('tipo');

    const conteo = {
      sistema: 0,
      pregunta: 0,
      respuesta: 0
    };

    resultados.forEach(item => {
      conteo[item.tipo] = parseInt(item.total);
    });

    return conteo;
  } catch (error) {
    throw new Error(`Error al contar mensajes: ${error.message}`);
  }
};

/**
 * Obtener último mensaje de una sesión
 * @param {number} sesionId - ID de la sesión
 * @param {string} tipo - Tipo de mensaje (opcional)
 * @returns {Promise<Object|null>} Último mensaje
 */
const obtenerUltimoMensaje = async (sesionId, tipo = null) => {
  try {
    let query = knex('cb_mensajes')
      .where('sesion_id', sesionId);

    if (tipo) {
      query = query.where('tipo', tipo);
    }

    return await query
      .orderBy('created_at', 'desc')
      .first();
  } catch (error) {
    throw new Error(`Error al obtener último mensaje: ${error.message}`);
  }
};

/**
 * Verificar si ya existe una respuesta para una pregunta en una sesión
 * @param {number} sesionId - ID de la sesión
 * @param {number} preguntaId - ID de la pregunta
 * @returns {Promise<boolean>} true si ya existe respuesta
 */
const existeRespuesta = async (sesionId, preguntaId) => {
  try {
    const resultado = await knex('cb_mensajes')
      .count('* as total')
      .where({
        sesion_id: sesionId,
        pregunta_id: preguntaId,
        tipo: 'respuesta'
      })
      .first();

    return resultado ? parseInt(resultado.total) > 0 : false;
  } catch (error) {
    throw new Error(`Error al verificar respuesta existente: ${error.message}`);
  }
};

/**
 * Eliminar todos los mensajes de una sesión
 * @param {number} sesionId - ID de la sesión
 * @returns {Promise<number>} Número de mensajes eliminados
 */
const eliminarPorSesion = async (sesionId) => {
  try {
    return await knex('cb_mensajes')
      .where('sesion_id', sesionId)
      .delete();
  } catch (error) {
    throw new Error(`Error al eliminar mensajes de sesión: ${error.message}`);
  }
};

module.exports = {
  crear,
  obtenerPorId,
  obtenerPorSesion,
  obtenerPreguntasSesion,
  obtenerRespuestasSesion,
  obtenerConversacionCompleta,
  actualizar,
  eliminar,
  contarPorTipo,
  obtenerUltimoMensaje,
  existeRespuesta,
  eliminarPorSesion
};
