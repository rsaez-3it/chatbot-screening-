/**
 * Repository: Email Templates
 * Maneja todas las operaciones de base de datos para cb_email_templates
 */

const { findAll, findOne, insert, update, remove } = require('../utils/queryHelper');

/**
 * Obtener todas las plantillas de email
 * @param {boolean} soloActivas - Filtrar solo plantillas activas
 * @returns {Promise<Array>} Lista de plantillas
 */
const obtenerTodas = async (soloActivas = false) => {
  try {
    let sql = 'SELECT * FROM cb_email_templates';

    if (soloActivas) {
      sql += ' WHERE activa = 1';
    }

    sql += ' ORDER BY codigo ASC';

    return await findAll(sql);
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
    const sql = 'SELECT * FROM cb_email_templates WHERE id = ?';
    return await findOne(sql, [id]);
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
    const sql = 'SELECT * FROM cb_email_templates WHERE codigo = ? AND activa = 1';
    return await findOne(sql, [codigo]);
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
    const sql = `
      INSERT INTO cb_email_templates (
        codigo,
        nombre,
        asunto,
        cuerpo,
        variables,
        descripcion,
        activa
      ) VALUES (?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      datos.codigo,
      datos.nombre,
      datos.asunto,
      datos.cuerpo,
      datos.variables ? JSON.stringify(datos.variables) : null,
      datos.descripcion || null,
      datos.activa !== undefined ? datos.activa : 1
    ];

    return await insert(sql, params);
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
    const campos = [];
    const valores = [];

    if (datos.nombre !== undefined) {
      campos.push('nombre = ?');
      valores.push(datos.nombre);
    }

    if (datos.asunto !== undefined) {
      campos.push('asunto = ?');
      valores.push(datos.asunto);
    }

    if (datos.cuerpo !== undefined) {
      campos.push('cuerpo = ?');
      valores.push(datos.cuerpo);
    }

    if (datos.variables !== undefined) {
      campos.push('variables = ?');
      valores.push(datos.variables ? JSON.stringify(datos.variables) : null);
    }

    if (datos.descripcion !== undefined) {
      campos.push('descripcion = ?');
      valores.push(datos.descripcion);
    }

    if (datos.activa !== undefined) {
      campos.push('activa = ?');
      valores.push(datos.activa);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    const sql = `UPDATE cb_email_templates SET ${campos.join(', ')} WHERE id = ?`;
    return await update(sql, valores);
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
    const sql = 'DELETE FROM cb_email_templates WHERE id = ?';
    return await remove(sql, [id]);
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
    let sql = 'SELECT COUNT(*) as total FROM cb_email_templates WHERE codigo = ?';
    const params = [codigo];

    if (excludeId) {
      sql += ' AND id != ?';
      params.push(excludeId);
    }

    const resultado = await findOne(sql, params);
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
