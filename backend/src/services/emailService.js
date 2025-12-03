/**
 * Service: Email
 * Maneja el envío de emails usando nodemailer
 */

const nodemailer = require('nodemailer');

/**
 * Crear transporter de nodemailer con configuración desde .env
 */
const crearTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT) || 587,
    secure: process.env.EMAIL_SECURE === 'true',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
};

/**
 * Enviar email de invitación a candidato
 */
const enviarInvitacion = async (destinatario, chatbot, linkSesion) => {
  try {
    const transporter = crearTransporter();

    const fromName = process.env.EMAIL_FROM_NAME || chatbot.nombre_asistente;
    const fromEmail = process.env.EMAIL_USER;

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: destinatario,
      subject: `Invitación: ${chatbot.nombre}`,
      html: generarHTMLInvitacion(chatbot, linkSesion)
    };

    const info = await transporter.sendMail(mailOptions);
    
    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
};

/**
 * Generar HTML del email de invitación
 */
const generarHTMLInvitacion = (chatbot, linkSesion) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 600px;
          margin: 0 auto;
          padding: 20px;
        }
        .container {
          background: #ffffff;
          border-radius: 8px;
          padding: 30px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
        }
        .header h1 {
          color: #2c3e50;
          margin: 0 0 10px 0;
        }
        .content {
          margin-bottom: 30px;
        }
        .button {
          display: inline-block;
          padding: 12px 30px;
          background: #3498db;
          color: #ffffff !important;
          text-decoration: none;
          border-radius: 5px;
          font-weight: 600;
          text-align: center;
        }
        .button:hover {
          background: #2980b9;
        }
        .info-box {
          background: #f8f9fa;
          border-left: 4px solid #3498db;
          padding: 15px;
          margin: 20px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #eee;
          color: #7f8c8d;
          font-size: 14px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🤖 ${chatbot.nombre}</h1>
          <p>Has sido invitado a participar en una evaluación</p>
        </div>
        
        <div class="content">
          <p>Hola,</p>
          <p>${chatbot.descripcion || 'Te invitamos a completar una evaluación mediante nuestro asistente virtual.'}</p>
          
          <div class="info-box">
            <strong>📋 Detalles de la evaluación:</strong><br>
            <strong>Asistente:</strong> ${chatbot.nombre_asistente}<br>
            <strong>Vigencia:</strong> ${chatbot.duracion_dias} días desde el inicio<br>
            <strong>Tiempo estimado:</strong> 10-15 minutos
          </div>
          
          <p>Para comenzar la evaluación, haz clic en el siguiente botón:</p>
          
          <p style="text-align: center; margin: 30px 0;">
            <a href="${linkSesion}" class="button">Iniciar Evaluación</a>
          </p>
          
          <p style="font-size: 14px; color: #7f8c8d;">
            O copia y pega este enlace en tu navegador:<br>
            <a href="${linkSesion}">${linkSesion}</a>
          </p>
        </div>
        
        <div class="footer">
          <p>Este es un email automático, por favor no respondas a este mensaje.</p>
          ${chatbot.email_reclutador ? `<p>Si tienes dudas, contacta a: ${chatbot.email_reclutador}</p>` : ''}
        </div>
      </div>
    </body>
    </html>
  `;
};

/**
 * Verificar configuración SMTP desde .env
 */
const verificarConfiguracion = async () => {
  try {
    const transporter = crearTransporter();
    await transporter.verify();
    return { success: true, message: 'Configuración SMTP válida' };
  } catch (error) {
    return { success: false, message: error.message };
  }
};

module.exports = {
  enviarInvitacion,
  verificarConfiguracion
};
