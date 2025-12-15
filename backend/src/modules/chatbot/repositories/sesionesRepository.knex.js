/**
 * Repository: Sesiones de Evaluación (Knex Version)
 * Versión con Knex.js - Query Builder seguro
 * NOTA: Este archivo coexiste con sesionesRepository.js durante la migración
 */

const knex = require('../../../config/knex');

/**
 * Crear una nueva sesión
 * @param {Object} datos - Datos de la sesión
 * @returns {Promise<number>} ID de la sesión creada
 */
const crear = async (datos) => {
  try {
    const sesionData = {
      config_id: datos.config_id,
      candidato_id: datos.candidato_id || null,
      token: datos.token,
      estado: datos.estado || 'pendiente',
      resultado: datos.resultado || 'sin_evaluar',
      puntaje_total: datos.puntaje_total || 0.00,
      porcentaje: datos.porcentaje || 0.00,
      candidato_nombre: datos.candidato_nombre || null,
      candidato_email: datos.candidato_email || null,
      candidato_telefono: datos.candidato_telefono || null,
      fecha_expiracion: datos.fecha_expiracion || null,
      metadata: datos.metadata ? JSON.stringify(datos.metadata) : null
    };

    const [id] = await knex('cb_sesiones').insert(sesionData);
    return id;
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
    return await knex('cb_sesiones')
      .where({ id })
      .first();
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
    return await knex('cb_sesiones')
      .where({ token })
      .first();
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
    let query = knex('cb_sesiones')
      .where('config_id', configId);

    if (filtros.estado) {
      query = query.where('estado', filtros.estado);
    }

    if (filtros.resultado) {
      query = query.where('resultado', filtros.resultado);
    }

    if (filtros.fecha_desde) {
      query = query.where('fecha_inicio', '>=', filtros.fecha_desde);
    }

    if (filtros.fecha_hasta) {
      query = query.where('fecha_inicio', '<=', filtros.fecha_hasta);
    }

    query = query.orderBy('id', 'desc');

    return await query;
  } catch (error) {
    throw new Error(`Error al obtener sesiones por config: ${error.message}`);
  }
};

/**
 * Listar todas las sesiones con paginación
 * @param {Object} opciones - Opciones de paginación y filtros
 * @returns {Promise<Object>} { data, total, page, limit }
 */
const listar = async (opciones = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      estado,
      resultado,
      config_id,
      candidato_email,
      fecha_desde,
      fecha_hasta
    } = opciones;

    const offset = (page - 1) * limit;

    // Función helper para aplicar filtros
    const applyFilters = (query) => {
      if (estado) {
        query = query.where('cb_sesiones.estado', estado);
      }
      if (resultado) {
        query = query.where('cb_sesiones.resultado', resultado);
      }
      if (config_id) {
        query = query.where('cb_sesiones.config_id', config_id);
      }
      if (candidato_email) {
        query = query.where('cb_sesiones.candidato_email', 'like', `%${candidato_email}%`);
      }
      if (fecha_desde) {
        query = query.where('cb_sesiones.fecha_inicio', '>=', fecha_desde);
      }
      if (fecha_hasta) {
        query = query.where('cb_sesiones.fecha_inicio', '<=', fecha_hasta);
      }
      return query;
    };

    // Query para contar (sin SELECT, solo COUNT)
    let countQuery = knex('cb_sesiones').count('* as total');
    countQuery = applyFilters(countQuery);
    const [{ total }] = await countQuery;

    // Query para obtener datos paginados (con SELECT y JOIN)
    let dataQuery = knex('cb_sesiones')
      .select(
        'cb_sesiones.*',
        'cb_config.nombre as chatbot_nombre'
      )
      .leftJoin('cb_config', 'cb_sesiones.config_id', 'cb_config.id');

    dataQuery = applyFilters(dataQuery);

    const data = await dataQuery
      .orderBy('cb_sesiones.id', 'desc')
      .limit(limit)
      .offset(offset);

    return {
      data,
      total: parseInt(total),
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit)
    };
  } catch (error) {
    throw new Error(`Error al listar sesiones: ${error.message}`);
  }
};

/**
 * Actualizar sesión
 * @param {number} id - ID de la sesión
 * @param {Object} datos - Datos a actualizar
 * @returns {Promise<number>} Número de filas afectadas
 */
const actualizar = async (id, datos) => {
  try {
    // Preparar datos para actualización (solo campos permitidos)
    const updateData = {};

    const camposPermitidos = [
      'estado',
      'resultado',
      'puntaje_total',
      'puntaje_maximo',
      'porcentaje_aprobacion',
      'umbral_aprobacion',
      'fecha_inicio',
      'fecha_fin',
      'fecha_completado',
      'candidato_nombre',
      'candidato_email',
      'candidato_telefono',
      'metadata',
      'respuestas_enviadas',
      'respuestas_correctas',
      'respuestas_incorrectas',
      'nota_adicional'
    ];

    // Solo agregar campos que existan en datos y estén permitidos
    camposPermitidos.forEach(campo => {
      if (datos.hasOwnProperty(campo)) {
        if (campo === 'metadata' && datos[campo]) {
          updateData[campo] = JSON.stringify(datos[campo]);
        } else {
          updateData[campo] = datos[campo];
        }
      }
    });

    return await knex('cb_sesiones')
      .where({ id })
      .update(updateData);
  } catch (error) {
    throw new Error(`Error al actualizar sesión: ${error.message}`);
  }
};

/**
 * Eliminar sesión
 * @param {number} id - ID de la sesión
 * @returns {Promise<number>} Número de filas eliminadas
 */
const eliminar = async (id) => {
  try {
    return await knex('cb_sesiones')
      .where({ id })
      .delete();
  } catch (error) {
    throw new Error(`Error al eliminar sesión: ${error.message}`);
  }
};

/**
 * Obtener sesiones expiradas
 * @returns {Promise<Array>} Lista de sesiones expiradas
 */
const obtenerExpiradas = async () => {
  try {
    const ahora = new Date();

    return await knex('cb_sesiones')
      .where('estado', 'pendiente')
      .where('fecha_expiracion', '<', ahora)
      .select('*');
  } catch (error) {
    throw new Error(`Error al obtener sesiones expiradas: ${error.message}`);
  }
};

/**
 * Marcar sesiones como expiradas
 * @param {Array<number>} ids - IDs de sesiones a expirar
 * @returns {Promise<number>} Número de sesiones actualizadas
 */
const marcarComoExpiradas = async (ids) => {
  try {
    return await knex('cb_sesiones')
      .whereIn('id', ids)
      .update({
        estado: 'expirada',
        resultado: 'expirada'
      });
  } catch (error) {
    throw new Error(`Error al marcar sesiones como expiradas: ${error.message}`);
  }
};

/**
 * Obtener estadísticas por configuración
 * @param {number} configId - ID del chatbot
 * @returns {Promise<Object>} Estadísticas
 */
const obtenerEstadisticas = async (configId) => {
  try {
    const stats = await knex('cb_sesiones')
      .where('config_id', configId)
      .select(
        knex.raw('COUNT(*) as total'),
        knex.raw('SUM(CASE WHEN estado = "pendiente" THEN 1 ELSE 0 END) as pendientes'),
        knex.raw('SUM(CASE WHEN estado = "en_progreso" THEN 1 ELSE 0 END) as en_progreso'),
        knex.raw('SUM(CASE WHEN estado = "completado" THEN 1 ELSE 0 END) as completadas'),
        knex.raw('SUM(CASE WHEN resultado = "aprobado" THEN 1 ELSE 0 END) as aprobados'),
        knex.raw('SUM(CASE WHEN resultado = "rechazado" THEN 1 ELSE 0 END) as rechazados'),
        knex.raw('AVG(porcentaje) as porcentaje_promedio')
      )
      .first();

    return {
      total: parseInt(stats.total) || 0,
      pendientes: parseInt(stats.pendientes) || 0,
      en_progreso: parseInt(stats.en_progreso) || 0,
      completadas: parseInt(stats.completadas) || 0,
      aprobados: parseInt(stats.aprobados) || 0,
      rechazados: parseInt(stats.rechazados) || 0,
      porcentaje_promedio: parseFloat(stats.porcentaje_promedio) || 0
    };
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
    return await knex('cb_sesiones as s')
      .select(
        's.*',
        'c.nombre as chatbot_nombre',
        'c.descripcion as chatbot_descripcion',
        'c.umbral_aprobacion',
        'c.nombre_asistente',
        'c.avatar_url',
        'c.idioma',
        'c.color_botones',
        'c.color_conversacion',
        'c.color_fondo',
        'c.mensaje_bienvenida',
        'c.mensaje_aprobado',
        'c.mensaje_rechazado',
        'c.email_reclutador'
      )
      .innerJoin('cb_config as c', 's.config_id', 'c.id')
      .where('s.token', token)
      .first();
  } catch (error) {
    throw new Error(`Error al obtener sesión completa: ${error.message}`);
  }
};

/**
 * Contar sesiones por estado
 * @param {number} configId - ID del chatbot
 * @returns {Promise<Object>} Conteo por cada estado
 */
const contarPorEstado = async (configId) => {
  try {
    const resultados = await knex('cb_sesiones')
      .select('estado')
      .count('* as total')
      .where('config_id', configId)
      .groupBy('estado');

    // Convertir array a objeto con todos los estados
    const conteo = {
      pendiente: 0,
      en_progreso: 0,
      completado: 0,
      expirado: 0,
      cancelado: 0
    };

    resultados.forEach(item => {
      conteo[item.estado] = parseInt(item.total);
    });

    return conteo;
  } catch (error) {
    throw new Error(`Error al contar sesiones por estado: ${error.message}`);
  }
};

/**
 * Obtener todas las sesiones con información del chatbot
 * @param {Object} filtros - Filtros opcionales (estado, config_id)
 * @returns {Promise<Array>} Lista de sesiones con nombre del chatbot
 */
const obtenerTodasConChatbot = async (filtros = {}) => {
  try {
    let query = knex('cb_sesiones as s')
      .select(
        's.*',
        'c.nombre as chatbot_nombre'
      )
      .innerJoin('cb_config as c', 's.config_id', 'c.id');

    // Aplicar filtros
    if (filtros.estado) {
      query = query.where('s.estado', filtros.estado);
    }

    if (filtros.config_id) {
      query = query.where('s.config_id', filtros.config_id);
    }

    return await query.orderBy('s.created_at', 'desc');
  } catch (error) {
    throw new Error(`Error al obtener sesiones con chatbot: ${error.message}`);
  }
};

module.exports = {
  crear,
  obtenerPorId,
  obtenerPorToken,
  obtenerPorConfig,
  listar,
  actualizar,
  eliminar,
  obtenerExpiradas,
  marcarComoExpiradas,
  obtenerEstadisticas,
  obtenerSesionCompleta,
  contarPorEstado,
  obtenerTodasConChatbot
};
