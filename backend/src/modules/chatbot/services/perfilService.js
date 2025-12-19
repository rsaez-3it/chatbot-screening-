/**
 * PerfilService - Manejo de preguntas de perfil del candidato
 * Las preguntas de perfil capturan datos básicos (nombre, email, teléfono)
 * y NO se evalúan, solo se guardan en la sesión
 */

const preguntasRepository = require('../repositories/preguntasRepository.knex');
const sesionesRepository = require('../repositories/sesionesRepository.knex');
const mensajesRepository = require('../repositories/mensajesRepository.knex');
const logger = require('../../../config/logger');

class PerfilService {
  /**
   * Obtener preguntas de perfil faltantes para una sesión
   * @param {number} configId - ID de la configuración del chatbot
   * @param {Object} sesion - Datos de la sesión
   * @returns {Promise<Array>} Preguntas de perfil que faltan
   */
  static async obtenerPreguntasFaltantes(configId, sesion) {
    try {
      // Obtener todas las preguntas de perfil del chatbot
      const todasLasPreguntas = await preguntasRepository.obtenerPorConfig(configId);
      const preguntasPerfil = todasLasPreguntas.filter(p => p.es_dato_perfil === 1);

      if (preguntasPerfil.length === 0) {
        return [];
      }

      // Filtrar las que ya tienen datos en la sesión
      const preguntasFaltantes = preguntasPerfil.filter(pregunta => {
        switch (pregunta.campo_perfil) {
          case 'nombre':
            return !sesion.candidato_nombre;
          case 'email':
            return !sesion.candidato_email;
          case 'telefono':
            return !sesion.candidato_telefono;
          default:
            return false; // Otros campos no se manejan por ahora
        }
      });

      return preguntasFaltantes;

    } catch (error) {
      logger.error('Error al obtener preguntas de perfil faltantes', {
        service: 'perfilService',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Guardar respuesta de pregunta de perfil en la sesión
   * @param {number} sesionId - ID de la sesión
   * @param {Object} pregunta - Pregunta de perfil
   * @param {string} respuesta - Respuesta del candidato
   * @returns {Promise<boolean>} true si se guardó correctamente
   */
  static async guardarRespuestaPerfil(sesionId, pregunta, respuesta) {
    try {
      const datosActualizar = {};

      switch (pregunta.campo_perfil) {
        case 'nombre':
          datosActualizar.candidato_nombre = respuesta.trim();
          break;
        case 'email':
          datosActualizar.candidato_email = respuesta.trim().toLowerCase();
          break;
        case 'telefono':
          datosActualizar.candidato_telefono = respuesta.trim();
          break;
        default:
          logger.warn('Campo de perfil desconocido', {
            service: 'perfilService',
            campoPerfil: pregunta.campo_perfil
          });
          return false;
      }

      // Actualizar sesión con los datos
      await sesionesRepository.actualizar(sesionId, datosActualizar);

      logger.info('Datos de perfil guardados', {
        service: 'perfilService',
        campoPerfil: pregunta.campo_perfil
      });
      return true;

    } catch (error) {
      logger.error('Error al guardar respuesta de perfil', {
        service: 'perfilService',
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Verificar si una pregunta es de perfil
   * @param {Object} pregunta - Pregunta a verificar
   * @returns {boolean} true si es pregunta de perfil
   */
  static esPreguntaPerfil(pregunta) {
    return pregunta.es_dato_perfil === 1 || pregunta.es_dato_perfil === true;
  }

  /**
   * Validar formato de respuesta según el campo de perfil
   * @param {Object} pregunta - Pregunta de perfil
   * @param {string} respuesta - Respuesta del candidato
   * @returns {Object} { valido: boolean, mensaje: string }
   */
  static validarRespuestaPerfil(pregunta, respuesta) {
    if (!respuesta || respuesta.trim().length === 0) {
      return {
        valido: false,
        mensaje: 'La respuesta no puede estar vacía'
      };
    }

    switch (pregunta.campo_perfil) {
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(respuesta.trim())) {
          return {
            valido: false,
            mensaje: 'Por favor ingresa un email válido (ejemplo: usuario@dominio.com)'
          };
        }
        break;

      case 'telefono':
        const telefonoRegex = /^[\d\s\+\-\(\)]+$/;
        if (!telefonoRegex.test(respuesta.trim())) {
          return {
            valido: false,
            mensaje: 'Por favor ingresa un teléfono válido (solo números, espacios, +, -, paréntesis)'
          };
        }
        break;

      case 'nombre':
        if (respuesta.trim().length < 2) {
          return {
            valido: false,
            mensaje: 'El nombre debe tener al menos 2 caracteres'
          };
        }
        break;
    }

    return {
      valido: true,
      mensaje: 'Válido'
    };
  }
}

module.exports = PerfilService;
