/**
 * pdfService.js
 * Servicio para generar reportes PDF de evaluaciones de candidatos
 * Sistema: ChatBot 3IT
 */

const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const https = require('https');
const HTTP_CONSTANTS = require('../constants/http');
const logger = require('../../config/logger');

// Rutas a las fuentes Century Gothic
const FONT_REGULAR = path.join(__dirname, '../fonts/centurygothic.ttf');
const FONT_BOLD = path.join(__dirname, '../fonts/centurygothic_bold.ttf');

/**
 * Genera un reporte PDF completo de la evaluación del candidato
 * @param {Object} sesionData - Datos completos de la sesión (con mensajes y evaluaciones)
 * @returns {Promise<Buffer>} - Buffer del PDF generado
 */
async function generarReporteCandidato(sesionData) {
  try {
    // Descargar logo de 3IT
    const logoUrl = HTTP_CONSTANTS.COMPANY_LOGO_URL;
    let logoBuffer = null;
    try {
      logoBuffer = await descargarImagen(logoUrl);
    } catch (error) {
      logger.warn('No se pudo descargar el logo de 3IT', {
        service: 'pdfService',
        error: error.message
      });
    }

    return new Promise((resolve, reject) => {
      try {
        // Crear documento PDF
        const doc = new PDFDocument({
          size: 'A4',
          margins: {
            top: 50,
            bottom: 50,
            left: 50,
            right: 50
          }
        });

        // Registrar fuentes Century Gothic
        doc.registerFont('CenturyGothic', FONT_REGULAR);
        doc.registerFont('CenturyGothic-Bold', FONT_BOLD);

        // Configurar fuente por defecto
        doc.font('CenturyGothic');

        // Buffer para almacenar el PDF
        const chunks = [];
        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => resolve(Buffer.concat(chunks)));
        doc.on('error', reject);

        // ==================== ENCABEZADO ====================

        // Agregar logo de 3IT en la esquina superior derecha
        if (logoBuffer) {
          try {
            doc.image(logoBuffer, 450, 50, { width: 95 });
          } catch (error) {
            logger.warn('Error al agregar logo al PDF', {
              service: 'pdfService',
              error: error.message
            });
          }
        }

        // Título principal
        doc.font('CenturyGothic-Bold')
           .fontSize(26)
           .fillColor('#005aee')
           .text('ChatBot 3IT', 50, 50, { align: 'left' });

        doc.moveDown(2);
        doc.strokeColor('#005aee')
           .lineWidth(2)
           .moveTo(50, doc.y)
           .lineTo(545, doc.y)
           .stroke();

        doc.moveDown(2);
        doc.font('CenturyGothic'); // Volver a fuente normal

      // ==================== INFORMACIÓN DEL CANDIDATO ====================
      doc.font('CenturyGothic-Bold')
         .fontSize(14)
         .fillColor('#005aee')
         .text('Información del Candidato', { underline: true });

      doc.moveDown(0.5);
      doc.font('CenturyGothic')
         .fontSize(11)
         .fillColor('#333333');

      agregarCampo(doc, 'Nombre', sesionData.candidato_nombre || 'No especificado');
      agregarCampo(doc, 'Email', sesionData.candidato_email || 'No especificado');
      agregarCampo(doc, 'Teléfono', sesionData.candidato_telefono || 'No especificado');
      agregarCampo(doc, 'Fecha de inicio', formatearFecha(sesionData.fecha_inicio));
      agregarCampo(doc, 'Fecha de finalización', formatearFecha(sesionData.fecha_fin || sesionData.fecha_completado));

      doc.moveDown(1.5);

      // ==================== RESULTADO DE LA EVALUACIÓN ====================
      doc.font('CenturyGothic-Bold')
         .fontSize(14)
         .fillColor('#005aee')
         .text('Resultado de la Evaluación', { underline: true });

      doc.moveDown(0.5);

      // Color según resultado
      let colorResultado, textoResultado;

      switch(sesionData.resultado) {
        case 'aprobado':
          colorResultado = '#28a745';
          textoResultado = 'Aprobado';
          break;
        case 'considerar':
          colorResultado = '#ff9800';
          textoResultado = 'Considerar';
          break;
        case 'rechazado':
        default:
          colorResultado = '#dc3545';
          textoResultado = 'Rechazado';
          break;
      }

      // Formatear porcentajes sin decimales innecesarios
      const porcentaje = Math.round(parseFloat(sesionData.porcentaje_aprobacion) || 0);
      const umbral = Math.round(parseFloat(sesionData.umbral_aprobacion) || 70);

      doc.font('CenturyGothic')
         .fontSize(11)
         .fillColor('#333333');

      agregarCampo(doc, 'Resultado', textoResultado);
      agregarCampo(doc, 'Porcentaje obtenido', `${porcentaje}%`);
      agregarCampo(doc, 'Umbral de aprobación', `${umbral}%`);

      doc.moveDown(1.5);

      // ==================== EVALUACIONES DESGLOSADAS ====================

      doc.font('CenturyGothic-Bold')
         .fontSize(14)
         .fillColor('#005aee')
         .text('Evaluaciones Desglosadas', { underline: true });

      doc.moveDown(0.5);

      if (sesionData.evaluaciones && sesionData.evaluaciones.length > 0) {
        // Filtrar solo preguntas de evaluación (excluir preguntas de perfil con peso = 1)
        const evaluacionesFiltradas = sesionData.evaluaciones.filter(e => {
          const pregunta = e.pregunta_texto?.toLowerCase() || '';
          // Excluir preguntas de perfil comunes
          const esPreguntaPerfil = 
            pregunta.includes('nombre') ||
            pregunta.includes('email') ||
            pregunta.includes('correo') ||
            pregunta.includes('teléfono') ||
            pregunta.includes('telefono') ||
            e.peso === 1; // Las preguntas de perfil típicamente tienen peso 1
          
          return !esPreguntaPerfil;
        });

        if (evaluacionesFiltradas.length === 0) {
          doc.font('CenturyGothic')
             .fontSize(11)
             .fillColor('#666666')
             .text('No hay evaluaciones técnicas registradas.', { italic: true });
        }

        evaluacionesFiltradas.forEach((evaluacion, index) => {
          // Verificar si necesitamos nueva página
          if (doc.y > 650) {
            doc.addPage();
          }

          // Encabezado de la evaluación
          doc.font('CenturyGothic-Bold')
             .fontSize(12)
             .fillColor('#005aee')
             .text(`Pregunta ${index + 1}`, { underline: true });

          doc.moveDown(0.3);

          // Pregunta
          doc.font('CenturyGothic')
             .fontSize(11)
             .fillColor('#333333')
             .text('Pregunta:', { continued: true })
             .fillColor('#666666')
             .text(` ${evaluacion.pregunta_texto || 'N/A'}`);

          // Respuesta
          doc.fillColor('#333333')
             .text('Respuesta:', { continued: true })
             .fillColor('#666666')
             .text(` ${evaluacion.respuesta_texto || 'N/A'}`);

          doc.moveDown(0.5);

          // Resultado
          const colorEval = evaluacion.es_correcta ? '#28a745' : '#dc3545';
          const textoEval = evaluacion.es_correcta ? '✓ Correcta' : '✗ Incorrecta';

          doc.fontSize(10)
             .fillColor('#333333')
             .text('Resultado:', { continued: true })
             .fillColor(colorEval)
             .text(` ${textoEval}`);

          // Puntaje (solo mostrar si es relevante, no para preguntas simples)
          if (evaluacion.peso > 1) {
            doc.fillColor('#333333')
               .text('Puntaje:', { continued: true })
               .fillColor('#666666')
               .text(` ${evaluacion.puntaje}/100`);
          }

          doc.moveDown(1);

          // Línea separadora
          doc.strokeColor('#cccccc')
             .lineWidth(0.5)
             .moveTo(50, doc.y)
             .lineTo(545, doc.y)
             .stroke();

          doc.moveDown(1);
        });
      } else {
        doc.font('CenturyGothic')
           .fontSize(11)
           .fillColor('#666666')
           .text('No hay evaluaciones registradas.', { italic: true });
      }

      // ==================== PIE DE PÁGINA ====================
      doc.fontSize(8)
         .fillColor('#999999')
         .text(
           `ChatBot 3IT - Sistema de Evaluación | Fecha de generación: ${formatearFecha(new Date())}`,
           50,
           750,
           { align: 'center', width: 495 }
         );

        // Finalizar documento
        doc.end();

      } catch (error) {
        reject(error);
      }
    });
  } catch (error) {
    throw error;
  }
}

/**
 * Guarda el PDF en el sistema de archivos
 * @param {Buffer} pdfBuffer - Buffer del PDF
 * @param {String} nombreArchivo - Nombre del archivo (sin extensión)
 * @returns {Promise<String>} - Ruta del archivo guardado
 */
async function guardarPDF(pdfBuffer, nombreArchivo) {
  const dirReportes = path.join(__dirname, '../../../reportes');

  // Crear directorio si no existe
  if (!fs.existsSync(dirReportes)) {
    fs.mkdirSync(dirReportes, { recursive: true });
  }

  const rutaArchivo = path.join(dirReportes, `${nombreArchivo}.pdf`);

  return new Promise((resolve, reject) => {
    fs.writeFile(rutaArchivo, pdfBuffer, (err) => {
      if (err) reject(err);
      else resolve(rutaArchivo);
    });
  });
}

// ==================== FUNCIONES AUXILIARES ====================

/**
 * Descarga una imagen desde una URL
 */
function descargarImagen(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode}`));
        return;
      }

      const chunks = [];
      response.on('data', (chunk) => chunks.push(chunk));
      response.on('end', () => resolve(Buffer.concat(chunks)));
      response.on('error', reject);
    }).on('error', reject);
  });
}

/**
 * Agrega un campo de información al PDF
 */
function agregarCampo(doc, etiqueta, valor) {
  doc.fontSize(11)
     .fillColor('#333333')
     .text(etiqueta + ':', { continued: true })
     .fillColor('#666666')
     .text(' ' + valor);
}

/**
 * Formatea una fecha a formato legible
 */
function formatearFecha(fecha) {
  if (!fecha) return 'N/A';
  const f = new Date(fecha);
  return f.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

/**
 * Formatea solo la fecha sin hora
 */
function formatearSoloFecha(fecha) {
  if (!fecha) return 'N/A';
  const f = new Date(fecha);
  return f.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

/**
 * Formatea solo la hora
 */
function formatearHora(fecha) {
  if (!fecha) return 'N/A';
  const f = new Date(fecha);
  return f.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
}

/**
 * Obtiene etiqueta legible del tipo de mensaje
 */
function obtenerEtiquetaTipo(tipo) {
  const tipos = {
    'sistema': 'Sistema',
    'pregunta': 'Pregunta',
    'respuesta': 'Respuesta del candidato'
  };
  return tipos[tipo] || tipo;
}

module.exports = {
  generarReporteCandidato,
  guardarPDF
};
