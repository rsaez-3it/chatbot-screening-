/**
 * Repository: Configuración de Chatbots (Knex Version)
 * Versión con Knex.js - Query Builder seguro
 */

const knex = require('../../../config/knex');

/**
 * Obtener todos los chatbots
 * @param {boolean} soloActivos - Si true, solo retorna chatbots activos
 * @returns {Promise<Array>} Lista de chatbots
 */
const obtenerTodos = async (soloActivos = false) => {
  try {
    let query = knex('cb_config');

    if (soloActivos) {
      query = query.where('activo', 1);
    }

    return await query.orderBy('created_at', 'desc');
  } catch (error) {
    throw new Error(`Error al obtener chatbots: ${error.message}`);
  }
};

/**
 * Obtener un chatbot por ID
 * @param {number} id - ID del chatbot
 * @returns {Promise<Object|null>} Chatbot encontrado o null
 */
const obtenerPorId = async (id) => {
  try {
    return await knex('cb_config')
      .where({ id })
      .first();
  } catch (error) {
    throw new Error(`Error al obtener chatbot por ID: ${error.message}`);
  }
};

/**
 * Obtener chatbot por nombre
 * @param {string} nombre - Nombre del chatbot
 * @returns {Promise<Object|null>} Chatbot encontrado o null
 */
const obtenerPorNombre = async (nombre) => {
  try {
    return await knex('cb_config')
      .where({ nombre })
      .first();
  } catch (error) {
    throw new Error(`Error al obtener chatbot por nombre: ${error.message}`);
  }
};

/**
 * Crear un nuevo chatbot
 * @param {Object} datos - Datos del chatbot
 * @returns {Promise<number>} ID del chatbot creado
 */
const crear = async (datos) => {
  try {
    const configData = {
      nombre: datos.nombre,
      descripcion: datos.descripcion || null,
      categoria: datos.categoria || null,
      duracion_dias: datos.duracion_dias || 7,
      umbral_aprobacion: datos.umbral_aprobacion || 70.00,
      nombre_asistente: datos.nombre_asistente || 'Asistente Virtual',
      avatar_url: datos.avatar_url || null,
      idioma: datos.idioma || 'es',
      color_botones: datos.color_botones || '#007bff',
      color_conversacion: datos.color_conversacion || '#f8f9fa',
      color_fondo: datos.color_fondo || '#ffffff',
      mensaje_bienvenida: datos.mensaje_bienvenida || null,
      mensaje_aprobado: datos.mensaje_aprobado || null,
      mensaje_rechazado: datos.mensaje_rechazado || null,
      email_reclutador: datos.email_reclutador || null,
      mensaje_finalizacion: datos.mensaje_finalizacion || null,
      smtp_config: datos.smtp_config ? JSON.stringify(datos.smtp_config) : null,
      activo: datos.activo !== undefined ? datos.activo : true
    };

    const [id] = await knex('cb_config').insert(configData);
    return id;
  } catch (error) {
    throw new Error(`Error al crear chatbot: ${error.message}`);
  }
};

/**
 * Actualizar un chatbot
 * @param {number} id - ID del chatbot
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
const actualizar = async (id, datos) => {
  try {
    const updateData = {};

    // Lista de campos permitidos
    const camposPermitidos = [
      'nombre', 'descripcion', 'categoria', 'duracion_dias', 'umbral_aprobacion',
      'nombre_asistente', 'avatar_url', 'idioma', 'color_botones',
      'color_conversacion', 'color_fondo', 'mensaje_bienvenida',
      'mensaje_aprobado', 'mensaje_rechazado', 'email_reclutador',
      'mensaje_finalizacion', 'smtp_config', 'activo'
    ];

    camposPermitidos.forEach(campo => {
      if (datos.hasOwnProperty(campo)) {
        if (campo === 'smtp_config' && datos[campo]) {
          updateData[campo] = JSON.stringify(datos[campo]);
        } else {
          updateData[campo] = datos[campo];
        }
      }
    });

    if (Object.keys(updateData).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    return await knex('cb_config')
      .where({ id })
      .update(updateData);
  } catch (error) {
    throw new Error(`Error al actualizar chatbot: ${error.message}`);
  }
};

/**
 * Desactivar un chatbot (soft delete)
 * @param {number} id - ID del chatbot
 * @returns {Promise<number>} Número de filas afectadas
 */
const desactivar = async (id) => {
  try {
    return await knex('cb_config')
      .where({ id })
      .update({ activo: false });
  } catch (error) {
    throw new Error(`Error al desactivar chatbot: ${error.message}`);
  }
};

/**
 * Eliminar un chatbot (hard delete)
 * @param {number} id - ID del chatbot
 * @returns {Promise<number>} Número de filas eliminadas
 */
const eliminar = async (id) => {
  try {
    return await knex('cb_config')
      .where({ id })
      .delete();
  } catch (error) {
    throw new Error(`Error al eliminar chatbot: ${error.message}`);
  }
};

/**
 * Contar chatbots por categoría
 * @param {string} categoria - Categoría a filtrar (opcional)
 * @returns {Promise<Object|number>} Conteo total o por categoría
 */
const contarPorCategoria = async (categoria) => {
  try {
    if (categoria) {
      const resultado = await knex('cb_config')
        .count('* as total')
        .where({ categoria })
        .first();
      return parseInt(resultado.total);
    } else {
      const resultados = await knex('cb_config')
        .select('categoria')
        .count('* as total')
        .groupBy('categoria');

      const conteo = {};
      resultados.forEach(item => {
        conteo[item.categoria || 'sin_categoria'] = parseInt(item.total);
      });
      return conteo;
    }
  } catch (error) {
    throw new Error(`Error al contar chatbots: ${error.message}`);
  }
};

module.exports = {
  obtenerTodos,
  obtenerPorId,
  obtenerPorNombre,
  crear,
  actualizar,
  desactivar,
  eliminar,
  contarPorCategoria
};
