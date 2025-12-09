/**
 * Repository: Sesiones de Evaluación
 * Maneja todas las operaciones de base de datos para cb_sesiones
 */

const { findAll, findOne, insert, update, remove, executeQuery } = require('../../../shared/utils/queryHelper');

/**
 * Crear una nueva sesión
 * @param {Object} datos - Datos de la sesión
 * @returns {Promise<number>} ID de la sesión creada
 */
const crear = async (datos) => {
  try {
    const sql = `
      INSERT INTO cb_sesiones (
        config_id,
        candidato_id,
        token,
        estado,
        resultado,
        puntaje_total,
        porcentaje,
        candidato_nombre,
        candidato_email,
        candidato_telefono,
        fecha_expiracion,
        metadata
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      datos.config_id,
      datos.candidato_id || null,
      datos.token,
      datos.estado || 'pendiente',
      datos.resultado || 'sin_evaluar',
      datos.puntaje_total || 0.00,
      datos.porcentaje || 0.00,
      datos.candidato_nombre || null,
      datos.candidato_email || null,
      datos.candidato_telefono || null,
      datos.fecha_expiracion || null,
      datos.metadata ? JSON.stringify(datos.metadata) : null
    ];

    return await insert(sql, params);
  } catch (error) {
    throw new Error(`Error al crear sesión: ${error.message}`);
  }
};

/**
 * Obtener sesión por ID
 * @param {number} id - ID de la sesión
 * @returns {Promise<Object|null>} Sesión encontrada o null
 */
const obtenerPorId = async (id) => {
  try {
    const sql = 'SELECT * FROM cb_sesiones WHERE id = ?';
    return await findOne(sql, [id]);
  } catch (error) {
    throw new Error(`Error al obtener sesión por ID: ${error.message}`);
  }
};

/**
 * Obtener sesión por token
 * @param {string} token - Token único de la sesión
 * @returns {Promise<Object|null>} Sesión encontrada o null
 */
const obtenerPorToken = async (token) => {
  try {
    const sql = 'SELECT * FROM cb_sesiones WHERE token = ?';
    return await findOne(sql, [token]);
  } catch (error) {
    throw new Error(`Error al obtener sesión por token: ${error.message}`);
  }
};

/**
 * Obtener todas las sesiones de un chatbot
 * @param {number} configId - ID del chatbot
 * @param {Object} filtros - Filtros opcionales (estado, resultado)
 * @returns {Promise<Array>} Lista de sesiones
 */
const obtenerPorConfig = async (configId, filtros = {}) => {
  try {
    let sql = 'SELECT * FROM cb_sesiones WHERE config_id = ?';
    const params = [configId];

    if (filtros.estado) {
      sql += ' AND estado = ?';
      params.push(filtros.estado);
    }

    if (filtros.resultado) {
      sql += ' AND resultado = ?';
      params.push(filtros.resultado);
    }

    sql += ' ORDER BY created_at DESC';

    return await findAll(sql, params);
  } catch (error) {
    throw new Error(`Error al obtener sesiones: ${error.message}`);
  }
};

/**
 * Obtener sesiones por email de candidato
 * @param {string} email - Email del candidato
 * @returns {Promise<Array>} Lista de sesiones
 */
const obtenerPorEmail = async (email) => {
  try {
    const sql = `
      SELECT * FROM cb_sesiones
      WHERE candidato_email = ?
      ORDER BY created_at DESC
    `;
    return await findAll(sql, [email]);
  } catch (error) {
    throw new Error(`Error al obtener sesiones por email: ${error.message}`);
  }
};

/**
 * Actualizar una sesión
 * @param {number} id - ID de la sesión
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
const actualizar = async (id, datos) => {
  try {
    const campos = [];
    const valores = [];

    if (datos.estado !== undefined) {
      campos.push('estado = ?');
      valores.push(datos.estado);

      // Si el estado cambia a "en_progreso", actualizar fecha_inicio
      if (datos.estado === 'en_progreso' && !datos.fecha_inicio) {
        campos.push('fecha_inicio = NOW()');
      }

      // Si el estado cambia a "completado", actualizar fecha_completado
      if (datos.estado === 'completado' && !datos.fecha_completado) {
        campos.push('fecha_completado = NOW()');
      }
    }

    if (datos.resultado !== undefined) {
      campos.push('resultado = ?');
      valores.push(datos.resultado);
    }

    if (datos.puntaje_total !== undefined) {
      campos.push('puntaje_total = ?');
      valores.push(datos.puntaje_total);
    }

    if (datos.porcentaje !== undefined) {
      campos.push('porcentaje = ?');
      valores.push(datos.porcentaje);
    }

    if (datos.candidato_nombre !== undefined) {
      campos.push('candidato_nombre = ?');
      valores.push(datos.candidato_nombre);
    }

    if (datos.candidato_email !== undefined) {
      campos.push('candidato_email = ?');
      valores.push(datos.candidato_email);
    }

    if (datos.candidato_telefono !== undefined) {
      campos.push('candidato_telefono = ?');
      valores.push(datos.candidato_telefono);
    }

    if (datos.fecha_inicio !== undefined) {
      campos.push('fecha_inicio = ?');
      valores.push(datos.fecha_inicio);
    }

    if (datos.fecha_completado !== undefined) {
      campos.push('fecha_completado = ?');
      valores.push(datos.fecha_completado);
    }

    if (datos.metadata !== undefined) {
      campos.push('metadata = ?');
      valores.push(datos.metadata ? JSON.stringify(datos.metadata) : null);
    }

    if (campos.length === 0) {
      throw new Error('No hay campos para actualizar');
    }

    valores.push(id);

    const sql = `UPDATE cb_sesiones SET ${campos.join(', ')} WHERE id = ?`;
    return await update(sql, valores);
  } catch (error) {
    throw new Error(`Error al actualizar sesión: ${error.message}`);
  }
};

/**
 * Marcar sesiones expiradas
 * Actualiza el estado de sesiones que pasaron su fecha de expiración
 * @returns {Promise<number>} Número de sesiones actualizadas
 */
const marcarExpiradas = async () => {
  try {
    const sql = `
      UPDATE cb_sesiones
      SET estado = 'expirado'
      WHERE estado IN ('pendiente', 'en_progreso')
        AND fecha_expiracion < NOW()
    `;
    return await update(sql, []);
  } catch (error) {
    throw new Error(`Error al marcar sesiones expiradas: ${error.message}`);
  }
};

/**
 * Verificar si una sesión está expirada
 * @param {number} id - ID de la sesión
 * @returns {Promise<boolean>} true si está expirada
 */
const estaExpirada = async (id) => {
  try {
    const sql = `
      SELECT
        fecha_expiracion < NOW() as expirada,
        estado
      FROM cb_sesiones
      WHERE id = ?
    `;
    const resultado = await findOne(sql, [id]);

    if (!resultado) return false;

    return resultado.expirada === 1 && resultado.estado !== 'completado';
  } catch (error) {
    throw new Error(`Error al verificar expiración: ${error.message}`);
  }
};

/**
 * Eliminar una sesión
 * @param {number} id - ID de la sesión
 * @returns {Promise<number>} Número de filas eliminadas
 */
const eliminar = async (id) => {
  try {
    const sql = 'DELETE FROM cb_sesiones WHERE id = ?';
    return await remove(sql, [id]);
  } catch (error) {
    throw new Error(`Error al eliminar sesión: ${error.message}`);
  }
};

/**
 * Contar sesiones por estado
 * @param {number} configId - ID del chatbot
 * @returns {Promise<Object>} Objeto con conteo por estado
 */
const contarPorEstado = async (configId) => {
  try {
    const sql = `
      SELECT
        estado,
        COUNT(*) as total
      FROM cb_sesiones
      WHERE config_id = ?
      GROUP BY estado
    `;
    const resultados = await findAll(sql, [configId]);

    // Convertir array a objeto
    const conteo = {
      pendiente: 0,
      en_progreso: 0,
      completado: 0,
      expirado: 0,
      cancelado: 0
    };

    resultados.forEach(item => {
      conteo[item.estado] = item.total;
    });

    return conteo;
  } catch (error) {
    throw new Error(`Error al contar sesiones: ${error.message}`);
  }
};

/**
 * Obtener estadísticas de sesiones
 * @param {number} configId - ID del chatbot
 * @returns {Promise<Object>} Estadísticas
 */
const obtenerEstadisticas = async (configId) => {
  try {
    const sql = `
      SELECT
        COUNT(*) as total,
        SUM(CASE WHEN resultado = 'aprobado' THEN 1 ELSE 0 END) as aprobados,
        SUM(CASE WHEN resultado = 'rechazado' THEN 1 ELSE 0 END) as rechazados,
        SUM(CASE WHEN estado = 'completado' THEN 1 ELSE 0 END) as completadas,
        AVG(CASE WHEN estado = 'completado' THEN porcentaje ELSE NULL END) as promedio_porcentaje,
        MAX(porcentaje) as max_porcentaje,
        MIN(CASE WHEN estado = 'completado' THEN porcentaje ELSE NULL END) as min_porcentaje
      FROM cb_sesiones
      WHERE config_id = ?
    `;
    return await findOne(sql, [configId]);
  } catch (error) {
    throw new Error(`Error al obtener estadísticas: ${error.message}`);
  }
};

/**
 * Obtener sesión completa con información del chatbot
 * @param {string} token - Token de la sesión
 * @returns {Promise<Object|null>} Sesión con datos del chatbot
 */
const obtenerSesionCompleta = async (token) => {
  try {
    const sql = `
      SELECT
        s.*,
        c.nombre as chatbot_nombre,
        c.descripcion as chatbot_descripcion,
        c.umbral_aprobacion,
        c.nombre_asistente,
        c.avatar_url,
        c.idioma,
        c.color_botones,
        c.color_conversacion,
        c.color_fondo,
        c.mensaje_bienvenida,
        c.mensaje_aprobado,
        c.mensaje_rechazado,
        c.email_reclutador
      FROM cb_sesiones s
      INNER JOIN cb_config c ON s.config_id = c.id
      WHERE s.token = ?
    `;
    return await findOne(sql, [token]);
  } catch (error) {
    throw new Error(`Error al obtener sesión completa: ${error.message}`);
  }
};

/**
 * Obtener todas las sesiones con información del chatbot
 * @param {Object} filtros - Filtros opcionales (estado, config_id)
 * @returns {Promise<Array>} Lista de sesiones con datos del chatbot
 */
const obtenerTodasConChatbot = async (filtros = {}) => {
  try {
    let sql = `
      SELECT
        s.*,
        c.nombre as chatbot_nombre
      FROM cb_sesiones s
      INNER JOIN cb_config c ON s.config_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (filtros.estado) {
      sql += ' AND s.estado = ?';
      params.push(filtros.estado);
    }

    if (filtros.config_id) {
      sql += ' AND s.config_id = ?';
      params.push(filtros.config_id);
    }

    sql += ' ORDER BY s.created_at DESC';

    return await findAll(sql, params);
  } catch (error) {
    throw new Error(`Error al obtener sesiones con chatbot: ${error.message}`);
  }
};

module.exports = {
  crear,
  obtenerPorId,
  obtenerPorToken,
  obtenerPorConfig,
  obtenerPorEmail,
  obtenerTodasConChatbot,
  actualizar,
  marcarExpiradas,
  estaExpirada,
  eliminar,
  contarPorEstado,
  obtenerEstadisticas,
  obtenerSesionCompleta
};
