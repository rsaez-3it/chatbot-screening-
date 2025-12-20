/**
 * Script para re-evaluar todas las respuestas de una sesión
 * Útil después de corregir bugs en los evaluadores
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');
const EvaluacionService = require('./src/modules/chatbot/services/evaluacion/evaluacionService');
const preguntasRepository = require('./src/modules/chatbot/repositories/preguntasRepository');

async function reEvaluarSesion(sesionId) {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log(`RE-EVALUANDO SESIÓN ${sesionId}`);
    console.log('='.repeat(80));
    console.log('');

    // 1. Obtener todos los mensajes de respuesta con sus evaluaciones
    const [mensajes] = await pool.query(`
      SELECT
        m.id as mensaje_id,
        m.pregunta_id,
        m.contenido as respuesta,
        e.id as evaluacion_id,
        p.pregunta,
        p.tipo_campo
      FROM cb_mensajes m
      INNER JOIN cb_preguntas p ON m.pregunta_id = p.id
      LEFT JOIN cb_evaluaciones e ON e.mensaje_id = m.id
      WHERE m.sesion_id = ? AND m.tipo = 'respuesta'
      ORDER BY m.created_at ASC
    `, [sesionId]);

    if (mensajes.length === 0) {
      console.log('⚠️  No hay respuestas para re-evaluar');
      await closePool();
      return;
    }

    console.log(`📝 Encontradas ${mensajes.length} respuestas para re-evaluar\n`);

    // 2. Re-evaluar cada respuesta
    for (const msg of mensajes) {
      console.log(`Pregunta ${msg.pregunta_id}: ${msg.pregunta}`);
      console.log(`Respuesta: "${msg.respuesta}"`);

      // Obtener pregunta completa con reglas
      const pregunta = await preguntasRepository.obtenerPorId(msg.pregunta_id);

      if (!pregunta) {
        console.log('❌ Pregunta no encontrada\n');
        continue;
      }

      // Evaluar
      const resultado = await EvaluacionService.evaluar(
        pregunta,
        msg.respuesta,
        sesionId,
        msg.mensaje_id
      );

      if (resultado.success) {
        const eval = resultado.evaluacion;
        console.log(`✅ Re-evaluada: ${eval.cumple ? '✓ CORRECTA' : '✗ INCORRECTA'} (${eval.puntaje}/100)`);
        console.log(`   Razón: ${eval.razon}`);
        
        // Eliminar evaluación anterior si existe
        if (msg.evaluacion_id) {
          await pool.query('DELETE FROM cb_evaluaciones WHERE id = ?', [msg.evaluacion_id]);
        }
      } else {
        console.log(`❌ Error: ${resultado.error}`);
      }
      console.log('');
    }

    console.log('='.repeat(80));
    console.log('✅ RE-EVALUACIÓN COMPLETADA');
    console.log('='.repeat(80));
    console.log('');
    console.log('Ahora puedes finalizar la sesión nuevamente para recalcular el resultado.');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

const sesionId = process.argv[2];

if (!sesionId) {
  console.log('');
  console.log('USO: node re-evaluar-sesion.js <sesion_id>');
  console.log('');
  console.log('Ejemplo: node re-evaluar-sesion.js 17');
  console.log('');
  process.exit(1);
}

reEvaluarSesion(parseInt(sesionId));
