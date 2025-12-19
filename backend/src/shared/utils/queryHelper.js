/**
 * Utilidad para ejecutar queries de MySQL de forma simplificada
 * Incluye manejo de errores y logs informativos
 */

const { getPool } = require('../../config/database');
const logger = require('../../config/logger');

/**
 * Ejecuta una query SQL con parámetros
 * @param {string} sql - Query SQL a ejecutar
 * @param {Array} params - Parámetros para la query (opcional)
 * @param {boolean} showLog - Mostrar logs en consola (default: false)
 * @returns {Promise<Array>} Resultados de la query
 */
const executeQuery = async (sql, params = [], showLog = false) => {
  let connection = null;

  try {
    // Obtener pool de conexiones
    const pool = await getPool();

    // Obtener una conexión del pool
    connection = await pool.getConnection();

    // Log opcional para debugging (sin exponer datos sensibles)
    if (showLog) {
      logger.debug('Ejecutando query SQL', {
        service: 'queryHelper',
        queryType: sql.split(' ')[0].toUpperCase(),
        hasParams: params.length > 0
      });
    }

    // Ejecutar la query
    const [rows] = await connection.execute(sql, params);

    // Log de resultado
    if (showLog) {
      logger.debug('Query ejecutada exitosamente', {
        service: 'queryHelper',
        rowsAffected: rows.length || rows.affectedRows || 0
      });
    }

    return rows;

  } catch (error) {
    // Log de error SIN exponer SQL ni parámetros sensibles
    logger.error('Error al ejecutar query SQL', {
      service: 'queryHelper',
      error: error.message,
      code: error.code,
      queryType: sql.split(' ')[0].toUpperCase()
    });
    throw error;

  } finally {
    // Liberar la conexión de vuelta al pool
    if (connection) {
      connection.release();
    }
  }
};

/**
 * Ejecuta una query SELECT y retorna un solo registro
 * @param {string} sql - Query SQL SELECT
 * @param {Array} params - Parámetros para la query
 * @param {boolean} showLog - Mostrar logs en consola
 * @returns {Promise<Object|null>} Primer registro encontrado o null
 */
const findOne = async (sql, params = [], showLog = false) => {
  try {
    const rows = await executeQuery(sql, params, showLog);
    return rows.length > 0 ? rows[0] : null;
  } catch (error) {
    logger.error('Error en findOne', {
      service: 'queryHelper',
      error: error.message
    });
    throw error;
  }
};

/**
 * Ejecuta una query SELECT y retorna todos los registros
 * @param {string} sql - Query SQL SELECT
 * @param {Array} params - Parámetros para la query
 * @param {boolean} showLog - Mostrar logs en consola
 * @returns {Promise<Array>} Array de registros encontrados
 */
const findAll = async (sql, params = [], showLog = false) => {
  try {
    return await executeQuery(sql, params, showLog);
  } catch (error) {
    logger.error('Error en findAll', {
      service: 'queryHelper',
      error: error.message
    });
    throw error;
  }
};

/**
 * Ejecuta una query INSERT y retorna el ID insertado
 * @param {string} sql - Query SQL INSERT
 * @param {Array} params - Parámetros para la query
 * @param {boolean} showLog - Mostrar logs en consola
 * @returns {Promise<number>} ID del registro insertado
 */
const insert = async (sql, params = [], showLog = false) => {
  try {
    const result = await executeQuery(sql, params, showLog);
    return result.insertId;
  } catch (error) {
    logger.error('Error en insert', {
      service: 'queryHelper',
      error: error.message
    });
    throw error;
  }
};

/**
 * Ejecuta una query UPDATE y retorna el número de filas afectadas
 * @param {string} sql - Query SQL UPDATE
 * @param {Array} params - Parámetros para la query
 * @param {boolean} showLog - Mostrar logs en consola
 * @returns {Promise<number>} Número de filas afectadas
 */
const update = async (sql, params = [], showLog = false) => {
  try {
    const result = await executeQuery(sql, params, showLog);
    return result.affectedRows;
  } catch (error) {
    logger.error('Error en update', {
      service: 'queryHelper',
      error: error.message
    });
    throw error;
  }
};

/**
 * Ejecuta una query DELETE y retorna el número de filas eliminadas
 * @param {string} sql - Query SQL DELETE
 * @param {Array} params - Parámetros para la query
 * @param {boolean} showLog - Mostrar logs en consola
 * @returns {Promise<number>} Número de filas eliminadas
 */
const remove = async (sql, params = [], showLog = false) => {
  try {
    const result = await executeQuery(sql, params, showLog);
    return result.affectedRows;
  } catch (error) {
    logger.error('Error en remove', {
      service: 'queryHelper',
      error: error.message
    });
    throw error;
  }
};

/**
 * Ejecuta múltiples queries dentro de una transacción
 * @param {Function} callback - Función que recibe la conexión y ejecuta las queries
 * @returns {Promise<any>} Resultado de la transacción
 */
const transaction = async (callback) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    // Iniciar transacción
    await connection.beginTransaction();
    logger.debug('Transacción iniciada', {
      service: 'queryHelper'
    });

    // Ejecutar el callback con la conexión
    const result = await callback(connection);

    // Confirmar transacción
    await connection.commit();
    logger.debug('Transacción confirmada', {
      service: 'queryHelper'
    });

    return result;

  } catch (error) {
    // Revertir transacción en caso de error
    await connection.rollback();
    logger.error('Transacción revertida', {
      service: 'queryHelper',
      error: error.message
    });
    throw error;

  } finally {
    // Liberar conexión
    connection.release();
  }
};

module.exports = {
  executeQuery,
  findOne,
  findAll,
  insert,
  update,
  remove,
  transaction
};
