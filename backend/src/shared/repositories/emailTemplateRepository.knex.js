/**
 * Repository: Email Templates (Knex.js)
 * Maneja todas las operaciones de base de datos para cb_email_templates
 * ✅ SEGURO: Usa Knex.js para prevenir SQL injection
 */

const knex = require('../../config/knex');

const TABLE_NAME = 'cb_email_templates';

/**
 * Obtener todas las plantillas de email
 * @param {boolean} soloActivas - Filtrar solo plantillas activas
 * @returns {Promise<Array>} Lista de plantillas
 */
const obtenerTodas = async (soloActivas = false) => {
  try {
    let query = knex(TABLE_NAME);

    if (soloActivas) {
      query = query.where('activa', 1);
    }

    return await query.orderBy('codigo', 'asc');
  } catch (error) {
    throw new Error(`Error al obtener plantillas: ${error.message}`);
  }
};

/**
 * Obtener una plantilla por ID
 * @param {number} id - ID de la plantilla
 * @returns {Promise<Object|null>} Plantilla encontrada o null
 */
const obtenerPorId = async (id) => {
  try {
    return await knex(TABLE_NAME)
      .where('id', id)
      .first();
  } catch (error) {
    throw new Error(`Error al obtener plantilla por ID: ${error.message}`);
  }
};

/**
 * Obtener una plantilla por código
 * @param {string} codigo - Código de la plantilla
 * @returns {Promise<Object|null>} Plantilla encontrada o null
 */
const obtenerPorCodigo = async (codigo) => {
  try {
    return await knex(TABLE_NAME)
      .where('codigo', codigo)
      .where('activa', 1)
      .first();
  } catch (error) {
    throw new Error(`Error al obtener plantilla por código: ${error.message}`);
  }
};

/**
 * Crear una nueva plantilla de email
 * @param {Object} datos - Datos de la plantilla
 * @returns {Promise<number>} ID de la plantilla creada
 */
const crear = async (datos) => {
  try {
    const [id] = await knex(TABLE_NAME).insert({
      codigo: datos.codigo,
      nombre: datos.nombre,
      asunto: datos.asunto,
      cuerpo: datos.cuerpo,
      variables: datos.variables ? JSON.stringify(datos.variables) : null,
      descripcion: datos.descripcion || null,
      activa: datos.activa !== undefined ? datos.activa : 1
    });

    return id;
  } catch (error) {
    throw new Error(`Error al crear plantilla: ${error.message}`);
  }
};

/**
 * Actualizar una plantilla existente
 * @param {number} id - ID de la plantilla
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
const actualizar = async (id, datos) => {
  try {
    const datosActualizar = {};

    if (datos.nombre !== undefined) {
      datosActualizar.nombre = datos.nombre;
    }

    if (datos.asunto !== undefined) {
      datosActualizar.asunto = datos.asunto;
    }

    if (datos.cuerpo !== undefined) {
      datosActualizar.cuerpo = datos.cuerpo;
    }

    if (datos.variables !== undefined) {
      datosActualizar.variables = datos.variables ? JSON.stringify(datos.variables) : null;
    }

    if (datos.descripcion !== undefined) {
      datosActualizar.descripcion = datos.descripcion;
    }

    if (datos.activa !== undefined) {
      datosActualizar.activa = datos.activa;
    }

    if (Object.keys(datosActualizar).length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    return await knex(TABLE_NAME)
      .where('id', id)
      .update(datosActualizar);
  } catch (error) {
    throw new Error(`Error al actualizar plantilla: ${error.message}`);
  }
};

/**
 * Eliminar una plantilla
 * @param {number} id - ID de la plantilla
 * @returns {Promise<number>} Número de filas eliminadas
 */
const eliminar = async (id) => {
  try {
    return await knex(TABLE_NAME)
      .where('id', id)
      .del();
  } catch (error) {
    throw new Error(`Error al eliminar plantilla: ${error.message}`);
  }
};

/**
 * Verificar si existe una plantilla con el código especificado
 * @param {string} codigo - Código a verificar
 * @param {number} excludeId - ID a excluir de la verificación (para updates)
 * @returns {Promise<boolean>} true si existe
 */
const existeCodigo = async (codigo, excludeId = null) => {
  try {
    let query = knex(TABLE_NAME)
      .where('codigo', codigo)
      .count('* as total');

    if (excludeId) {
      query = query.whereNot('id', excludeId);
    }

    const resultado = await query.first();
    return resultado ? resultado.total > 0 : false;
  } catch (error) {
    throw new Error(`Error al verificar código: ${error.message}`);
  }
};

/**
 * Renderizar plantilla con variables
 * @param {string} template - Template con placeholders {{variable}}
 * @param {Object} variables - Objeto con las variables a reemplazar
 * @returns {string} Template renderizado
 */
const renderizar = (template, variables) => {
  if (!template) return '';

  let resultado = template;

  // Reemplazar variables {{nombre_variable}}
  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    resultado = resultado.replace(regex, variables[key] || '');
  });

  return resultado;
};

module.exports = {
  obtenerTodas,
  obtenerPorId,
  obtenerPorCodigo,
  crear,
  actualizar,
  eliminar,
  existeCodigo,
  renderizar
};
