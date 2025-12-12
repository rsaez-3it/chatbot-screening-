/**
 * EmailService - Servicio de envío de emails
 * Usa nodemailer y plantillas de cb_email_templates
 */

console.log('🚀 Cargando emailService.js - VERSIÓN NUEVA');

const nodemailer = require('nodemailer');
const emailTemplateRepository = require('../repositories/emailTemplateRepository');
const pdfService = require('./pdfService');
const fs = require('fs');
const path = require('path');

/**
 * Crear transporter de nodemailer
 * @returns {Object} Transporter configurado
 */
const crearTransporter = () => {
  const config = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true', // true para 465, false para otros
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  };

  return nodemailer.createTransport(config);
};

/**
 * Obtener plantilla HTML desde archivo o base de datos
 * @param {string} codigo - Código de la plantilla
 * @returns {Promise<Object>} Plantilla con asunto y cuerpo
 */
const obtenerPlantilla = async (codigo) => {
  try {
    // 1. Intentar obtener de base de datos
    const plantillaBD = await emailTemplateRepository.obtenerPorCodigo(codigo);

    if (plantillaBD) {
      return {
        asunto: plantillaBD.asunto,
        cuerpo: plantillaBD.cuerpo,
        fuente: 'base_datos'
      };
    }

    // 2. Si no existe en BD, usar plantilla HTML de archivo
    const templatePath = path.join(__dirname, '../templates/emails', `${codigo}.html`);

    if (fs.existsSync(templatePath)) {
      const cuerpo = fs.readFileSync(templatePath, 'utf-8');

      // Asuntos por defecto según código
      const asuntosPorDefecto = {
        'invitacion': '¡Has sido invitado a una entrevista!',
        'aprobado': '¡Felicitaciones! Has aprobado la evaluación',
        'rechazado': 'Resultado de tu evaluación',
        'notificacion-reclutador': 'Nuevo candidato evaluado',
        'recordatorio': 'Recordatorio: Completa tu entrevista'
      };

      return {
        asunto: asuntosPorDefecto[codigo] || 'Notificación del sistema',
        cuerpo,
        fuente: 'archivo'
      };
    }

    throw new Error(`No se encontró plantilla para el código: ${codigo}`);

  } catch (error) {
    throw new Error(`Error al obtener plantilla: ${error.message}`);
  }
};

/**
 * Renderizar plantilla con variables
 * @param {string} template - Template con {{variables}}
 * @param {Object} variables - Variables a reemplazar
 * @returns {string} Template renderizado
 */
const renderizarPlantilla = (template, variables) => {
  let resultado = template;

  Object.keys(variables).forEach(key => {
    const regex = new RegExp(`{{${key}}}`, 'g');
    resultado = resultado.replace(regex, variables[key] || '');
  });

  return resultado;
};

/**
 * Enviar email genérico
 * @param {string} destinatario - Email del destinatario
 * @param {string} asunto - Asunto del email
 * @param {string} cuerpoHtml - Cuerpo HTML del email
 * @param {string} cuerpoTexto - Cuerpo texto plano (opcional)
 * @param {Array} attachments - Archivos adjuntos (opcional)
 * @returns {Promise<Object>} Información del envío
 */
const enviarEmail = async (destinatario, asunto, cuerpoHtml, cuerpoTexto = null, attachments = []) => {
  try {
    // Verificar configuración
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
      console.warn('⚠️  Configuración de email no encontrada. Email no enviado (modo desarrollo)');
      return {
        success: true,
        modo: 'desarrollo',
        mensaje: 'Email no enviado (configuración no disponible)',
        destinatario,
        asunto
      };
    }

    const transporter = crearTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME || 'ChatBot 3IT'}" <${process.env.EMAIL_USER}>`,
      to: destinatario,
      subject: asunto,
      html: cuerpoHtml,
      text: cuerpoTexto || cuerpoHtml.replace(/<[^>]*>/g, ''), // Strip HTML si no hay texto
      attachments: attachments
    };

    const info = await transporter.sendMail(mailOptions);

    console.log(`✅ Email enviado a ${destinatario}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      destinatario,
      asunto
    };

  } catch (error) {
    console.error('❌ Error al enviar email:', error);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
};

/**
 * Enviar invitación a candidato
 * @param {string} candidatoEmail - Email del candidato
 * @param {string} chatbotUrl - URL del chatbot
 * @param {Object} config - Configuración del chatbot
 * @param {Object} sesion - Datos de la sesión
 * @returns {Promise<Object>} Resultado del envío
 */
const enviarInvitacion = async (candidatoEmail, chatbotUrl, config, sesion) => {
  try {
    console.log('='.repeat(80));
    console.log('🔍 DEBUG enviarInvitacion');
    console.log('📧 Email:', candidatoEmail);
    console.log('🔗 URL:', chatbotUrl);
    console.log('⚙️  Config:', config ? config.nombre : 'undefined');
    console.log('👤 Sesion:', sesion ? sesion.candidato_nombre : 'undefined');
    console.log('='.repeat(80));

    const fechaExpiracion = new Date(sesion.fecha_expiracion).toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });

    const asunto = `Tu Evaluación Profesional está Lista`;

    // Personalizar saludo según si hay nombre o no
    const saludo = sesion.candidato_nombre 
      ? `Hola <strong>${sesion.candidato_nombre}</strong>,` 
      : 'Hola,';

    const cuerpo = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #ffffff;">
  <div style="max-width: 600px; margin: 20px auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
    
    <!-- Logo -->
    <div style="background-color: #ffffff; text-align: center; padding: 30px 20px 10px;">
      <img src="https://static.wixstatic.com/media/3ec04d_1f1f0d021fce4472a254b66aca24f876~mv2.png" alt="3IT" style="max-width: 100px; height: auto;">
    </div>

    <!-- Header -->
    <div style="background: linear-gradient(135deg, #1e88e5 0%, #00acc1 100%); padding: 30px; text-align: center; border-radius: 20px; margin: 0 20px 20px 20px;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">CONVERSACIÓN VIRTUAL</h1>
    </div>

    <!-- Badge -->
    <div style="text-align: center; margin: 20px 0;">
      <div style="display: inline-block; background-color: #ffffff; padding: 12px 25px; border-radius: 25px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
        <span style="font-size: 18px; margin-right: 5px;">💬</span>
        <span style="font-size: 16px; font-weight: bold; color: #333333;">¡Queremos conocerte!</span>
      </div>
    </div>

    <!-- Contenido -->
    <div style="padding: 20px 30px;">
      <p style="color: #333333; font-size: 15px; margin: 0 0 10px 0;">${saludo}</p>
      <p style="color: #666666; font-size: 14px; line-height: 1.6; margin: 0 0 20px 0;">
        Nos encantaría saber más de ti. Te invitamos a conversar con nuestro asistente virtual: <strong>"${config.nombre}"</strong>
      </p>

      <!-- Info box -->
      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 20px; margin: 0 0 20px 0;">
        <h3 style="color: #333333; font-size: 15px; margin: 0 0 12px 0;">💬 Información</h3>
        <p style="color: #666666; font-size: 13px; margin: 5px 0;">📅 <strong>Disponible hasta:</strong> ${fechaExpiracion}</p>
        <p style="color: #666666; font-size: 13px; margin: 5px 0;">📱 <strong>Dispositivos:</strong> Funciona en computadora, tablet o celular</p>
        <p style="color: #666666; font-size: 13px; margin: 5px 0;">⏱️ <strong>Tiempo:</strong> Sin límite por pregunta, responde con calma</p>
      </div>

      <!-- Botón -->
      <div style="text-align: center; margin: 0 0 20px 0;">
        <a href="${chatbotUrl}" style="display: inline-block; background: linear-gradient(135deg, #1e88e5 0%, #00acc1 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 25px; font-size: 15px; font-weight: bold;">
          Comenzar Conversación
        </a>
      </div>

      <!-- Token -->
      <div style="background-color: #f5f5f5; border-radius: 8px; padding: 15px; margin: 0 0 20px 0;">
        <p style="color: #666666; font-size: 12px; margin: 0 0 5px 0;">Token de acceso: <strong style="color: #333333;">${sesion.token.substring(0, 12)}...</strong></p>
        <p style="color: #666666; font-size: 12px; margin: 0;">Enlace directo: <a href="${chatbotUrl}" style="color: #1e88e5; text-decoration: none;">${chatbotUrl}</a></p>
      </div>

      <!-- Consejos -->
      <div style="border-left: 3px solid #1e88e5; padding-left: 15px; margin: 0 0 15px 0;">
        <p style="color: #1e88e5; font-size: 14px; font-weight: bold; margin: 0 0 8px 0;">💡 Recomendaciones:</p>
        <ul style="color: #666666; font-size: 13px; margin: 0; padding-left: 20px; line-height: 1.6;">
          <li>Busca un momento tranquilo para responder</li>
          <li>Lee cada pregunta con atención</li>
          <li>Responde de forma honesta y natural</li>
        </ul>
      </div>
    </div>

    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center;">
      <p style="color: #666666; font-size: 12px; margin: 0 0 5px 0;">Este email fue enviado por <strong>3IT</strong></p>
      <p style="color: #999999; font-size: 11px; margin: 0;">Si tienes problemas técnicos, contacta a nuestro equipo de soporte.</p>
    </div>

  </div>
</body>
</html>
    `;

    return await enviarEmail(candidatoEmail, asunto, cuerpo);

  } catch (error) {
    console.error('Error al enviar invitación:', error);
    throw error;
  }
};

// NOTA: Las funciones enviarAprobado y enviarRechazado fueron eliminadas
// El candidato NO recibe emails después de completar la evaluación
// Solo el reclutador recibe notificación con PDF adjunto

/**
 * Notificar al reclutador sobre nueva evaluación completada
 * INCLUYE: Conversación completa + Evaluaciones desglosadas + PDF adjunto
 * @param {string} reclutadorEmail - Email del reclutador
 * @param {Object} sesionData - Datos completos de la sesión (con mensajes y evaluaciones)
 * @returns {Promise<Object>} Resultado del envío
 */
const notificarReclutador = async (reclutadorEmail, sesionData) => {
  try {
    console.log(`📧 Notificando a reclutador: ${reclutadorEmail}`);

    // 1. GENERAR PDF
    console.log('📄 Generando PDF del reporte...');
    const pdfBuffer = await pdfService.generarReporteCandidato(sesionData);

    // 2. CONSTRUIR EMAIL SIMPLE (todo está en el PDF)
    let textoResultado, colorResultado;
    
    switch(sesionData.resultado) {
      case 'aprobado':
        textoResultado = 'APROBADO ✅';
        colorResultado = '#28a745';
        break;
      case 'considerar':
        textoResultado = 'CONSIDERAR ⚠️';
        colorResultado = '#ff9800';
        break;
      case 'rechazado':
      default:
        textoResultado = 'RECHAZADO ❌';
        colorResultado = '#dc3545';
        break;
    }

    const cuerpoHtml = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Evaluación Completada - ChatBot 3IT</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333333;
      background-color: #f5f5f5;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 20px auto;
      background-color: #ffffff;
      border: 1px solid #e0e0e0;
      border-radius: 8px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      overflow: hidden;
    }
    .logo {
      text-align: center;
      padding: 30px 20px 10px;
      background-color: #ffffff;
    }
    .logo img {
      max-width: 100px;
      height: auto;
    }
    .header {
      background: linear-gradient(135deg, #1e88e5 0%, #00acc1 100%);
      color: #ffffff;
      padding: 30px;
      text-align: center;
      border-radius: 20px;
      margin: 0 20px 20px 20px;
    }
    .header h1 {
      margin: 0 0 10px 0;
      font-size: 28px;
      font-weight: 600;
    }
    .header p {
      margin: 0;
      font-size: 16px;
      opacity: 0.95;
    }
    .content {
      padding: 40px 30px;
      text-align: center;
    }
    .resultado-badge {
      display: inline-block;
      padding: 15px 30px;
      border-radius: 8px;
      font-size: 24px;
      font-weight: 700;
      margin: 20px 0;
      color: #ffffff;
      background-color: ${colorResultado};
    }
    .candidato-info {
      background-color: #f8f9fa;
      border-radius: 8px;
      padding: 20px;
      margin: 30px 0;
      text-align: left;
    }
    .candidato-info p {
      margin: 8px 0;
      font-size: 15px;
    }
    .candidato-info strong {
      color: #1a73e8;
    }
    .pdf-info {
      background-color: #e3f2fd;
      border: 2px solid #1a73e8;
      border-radius: 8px;
      padding: 25px;
      margin: 30px 0;
    }
    .pdf-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .pdf-info h3 {
      margin: 0 0 10px 0;
      color: #1a73e8;
      font-size: 18px;
    }
    .pdf-info p {
      margin: 5px 0;
      color: #555555;
      font-size: 14px;
    }
    .footer {
      background-color: #f8f9fa;
      padding: 20px;
      text-align: center;
      color: #666666;
      font-size: 13px;
      border-top: 1px solid #dee2e6;
    }
  </style>
</head>
<body>
  <div class="container">
    
    <div class="logo">
      <img src="https://static.wixstatic.com/media/3ec04d_1f1f0d021fce4472a254b66aca24f876~mv2.png" alt="3IT Logo">
    </div>

    <div class="header">
      <h1>ChatBot 3IT</h1>
      <p>Nueva Evaluación Completada</p>
    </div>

    <div class="content">
      
      <div class="resultado-badge">${textoResultado}</div>
      
      <div class="candidato-info">
        <p><strong>Candidato:</strong> ${sesionData.candidato_nombre || 'No especificado'}</p>
        <p><strong>Email:</strong> ${sesionData.candidato_email || 'No especificado'}</p>
        <p><strong>Chatbot:</strong> ${sesionData.chatbot_nombre || 'Evaluación'}</p>
        <p><strong>Fecha:</strong> ${new Date(sesionData.fecha_fin || sesionData.fecha_completado).toLocaleString('es-ES', {
          year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'
        })}</p>
      </div>

      <div class="pdf-info">
        <div class="pdf-icon">📄</div>
        <h3>Reporte Completo Adjunto</h3>
        <p>Revisa el PDF adjunto para ver el detalle completo de la evaluación:</p>
        <p>✓ Todas las preguntas y respuestas</p>
        <p>✓ Evaluaciones desglosadas</p>
        <p>✓ Puntajes y retroalimentación</p>
      </div>

    </div>

    <div class="footer">
      <p>Este es un correo automático generado por <strong>ChatBot 3IT</strong></p>
      <p>${new Date().toLocaleString('es-ES')}</p>
    </div>

  </div>
</body>
</html>
    `;

    // 3. ADJUNTAR PDF
    const attachments = [
      {
        filename: `evaluacion_${sesionData.candidato_nombre?.replace(/\s+/g, '_') || sesionData.token}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf'
      }
    ];

    // 4. ENVIAR EMAIL
    const asunto = `[ChatBot 3IT] Nueva Evaluación Completada - ${sesionData.candidato_nombre || 'Candidato'} (${textoResultado})`;

    return await enviarEmail(reclutadorEmail, asunto, cuerpoHtml, null, attachments);

  } catch (error) {
    console.error('Error al notificar a reclutador:', error);
    throw error;
  }
};

/**
 * Enviar recordatorio de evaluación pendiente
 * @param {string} candidatoEmail - Email del candidato
 * @param {string} chatbotUrl - URL del chatbot
 * @param {number} horasRestantes - Horas restantes antes de expiración
 * @param {Object} sesion - Datos de la sesión
 * @returns {Promise<Object>} Resultado del envío
 */
const enviarRecordatorio = async (candidatoEmail, chatbotUrl, horasRestantes, sesion) => {
  try {
    console.log(`📧 Enviando recordatorio a ${candidatoEmail}`);

    const plantilla = await obtenerPlantilla('recordatorio');

    const variables = {
      nombre_candidato: sesion.candidato_nombre || 'Candidato',
      nombre_chatbot: sesion.chatbot_nombre || 'Evaluación',
      chatbot_url: chatbotUrl,
      horas_restantes: horasRestantes,
      fecha_expiracion: new Date(sesion.fecha_expiracion).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    };

    const asunto = renderizarPlantilla(plantilla.asunto, variables);
    const cuerpo = renderizarPlantilla(plantilla.cuerpo, variables);

    return await enviarEmail(candidatoEmail, asunto, cuerpo);

  } catch (error) {
    console.error('Error al enviar recordatorio:', error);
    throw error;
  }
};

/**
 * Verificar configuración de email
 * @returns {Object} Estado de la configuración
 */
const verificarConfiguracion = () => {
  const config = {
    configurado: !!(process.env.EMAIL_USER && process.env.EMAIL_PASS),
    host: process.env.EMAIL_HOST || 'No configurado',
    port: process.env.EMAIL_PORT || 'No configurado',
    user: process.env.EMAIL_USER || 'No configurado',
    fromName: process.env.EMAIL_FROM_NAME || 'No configurado'
  };

  return config;
};

/**
 * Enviar email de prueba
 * @param {string} destinatario - Email de destino
 * @returns {Promise<Object>} Resultado del envío
 */
const enviarEmailPrueba = async (destinatario) => {
  try {
    const asunto = 'Email de prueba - Sistema de Screening';
    const cuerpo = `
      <h1>Email de Prueba</h1>
      <p>Este es un email de prueba del sistema de screening.</p>
      <p>Si recibes este mensaje, la configuración de email está funcionando correctamente.</p>
      <p><strong>Fecha:</strong> ${new Date().toLocaleString('es-ES')}</p>
    `;

    return await enviarEmail(destinatario, asunto, cuerpo);

  } catch (error) {
    throw error;
  }
};

module.exports = {
  enviarEmail,
  enviarInvitacion,
  // enviarAprobado y enviarRechazado ELIMINADOS - El candidato NO recibe emails
  notificarReclutador,
  enviarRecordatorio,
  verificarConfiguracion,
  enviarEmailPrueba
};
