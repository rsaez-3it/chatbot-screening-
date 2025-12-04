/**
 * Controller: Invitaciones
 * Maneja el envío de invitaciones por email a candidatos
 */

const configRepository = require('../repositories/configRepository');
const sesionesRepository = require('../repositories/sesionesRepository');
const emailService = require('../../../shared/services/emailService');

/**
 * POST /api/config/:id/invitar
 * Enviar invitación a uno o varios candidatos
 * Body: { 
 *   candidatos: [
 *     { email: 'email1@example.com', nombre: 'Juan Pérez', telefono: '+56912345678' },
 *     { email: 'email2@example.com', nombre: 'María González' }
 *   ]
 * }
 * O formato legacy: { emails: ['email1@example.com', 'email2@example.com'] }
 */
const enviarInvitaciones = async (req, res, next) => {
  try {
    const { id } = req.params;
    let { candidatos, emails } = req.body;

    // Soporte para formato legacy (solo emails)
    if (emails && Array.isArray(emails)) {
      candidatos = emails.map(email => ({ email }));
    }

    // Validar que se proporcionaron candidatos
    if (!candidatos || !Array.isArray(candidatos) || candidatos.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Se requiere un array de candidatos con al menos el email'
      });
    }

    // Validar formato de emails
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const candidatosInvalidos = candidatos.filter(c => !c.email || !emailRegex.test(c.email));
    if (candidatosInvalidos.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'Algunos candidatos tienen email inválido o faltante',
        candidatosInvalidos
      });
    }

    // Obtener configuración del chatbot
    const chatbot = await configRepository.obtenerPorId(id);
    if (!chatbot) {
      return res.status(404).json({
        success: false,
        message: 'Chatbot no encontrado'
      });
    }

    // Verificar que el chatbot esté activo
    if (!chatbot.activo) {
      return res.status(400).json({
        success: false,
        message: 'El chatbot no está activo'
      });
    }

    // Verificar que exista configuración de email en .env
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Configuración de email no encontrada en el servidor'
      });
    }

    const resultados = [];
    const errores = [];

    // Enviar invitación a cada candidato
    for (const candidato of candidatos) {
      try {
        // Generar token único para la sesión
        const token = require('crypto').randomBytes(32).toString('hex');
        
        // Calcular fecha de expiración
        const fechaExpiracion = new Date();
        fechaExpiracion.setDate(fechaExpiracion.getDate() + chatbot.duracion_dias);

        // Crear sesión para el candidato con TODOS sus datos
        const sesionData = {
          config_id: id,
          token: token,
          candidato_email: candidato.email,
          candidato_nombre: candidato.nombre || null,
          candidato_telefono: candidato.telefono || null,
          estado: 'pendiente',
          fecha_expiracion: fechaExpiracion.toISOString().slice(0, 19).replace('T', ' ')
        };

        const sesionId = await sesionesRepository.crear(sesionData);
        
        // Generar link único de la sesión usando el token
        const baseUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        const linkSesion = `${baseUrl}/chat/${token}`;

        // Crear objeto sesión completo para el email
        const sesionParaEmail = {
          candidato_nombre: candidato.nombre,
          candidato_email: candidato.email,
          candidato_telefono: candidato.telefono,
          token: token,
          fecha_expiracion: fechaExpiracion
        };

        // DEBUG: Log antes de enviar email
        console.log('🔥 INVITACION CONTROLLER - Enviando email a:', candidato.email);
        console.log('🔥 Link:', linkSesion);
        console.log('🔥 Chatbot:', chatbot.nombre);
        console.log('🔥 Sesion:', sesionParaEmail);

        // Enviar email con los parámetros correctos
        const resultado = await emailService.enviarInvitacion(
          candidato.email,
          linkSesion,
          chatbot,
          sesionParaEmail
        );
        
        console.log('✅ Email enviado, messageId:', resultado.messageId);

        resultados.push({
          email: candidato.email,
          nombre: candidato.nombre,
          sesionId,
          enviado: true,
          messageId: resultado.messageId
        });

      } catch (error) {
        console.error(`Error al enviar invitación a ${candidato.email}:`, error);
        errores.push({
          email: candidato.email,
          nombre: candidato.nombre,
          error: error.message
        });
      }
    }

    // Responder con resultados
    const response = {
      success: errores.length === 0,
      message: `${resultados.length} de ${candidatos.length} invitaciones enviadas`,
      enviados: resultados.length,
      fallidos: errores.length,
      resultados
    };

    if (errores.length > 0) {
      response.errores = errores;
    }

    res.json(response);

  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/config/:id/verificar-smtp
 * Verificar configuración SMTP desde .env
 */
const verificarSMTP = async (req, res, next) => {
  try {
    // Verificar que exista configuración en .env
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      return res.status(500).json({
        success: false,
        message: 'Configuración de email no encontrada en el servidor'
      });
    }

    // Verificar configuración
    const resultado = await emailService.verificarConfiguracion();

    res.json(resultado);

  } catch (error) {
    next(error);
  }
};

module.exports = {
  enviarInvitaciones,
  verificarSMTP
};
