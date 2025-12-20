/**
 * Script para ver las respuestas de una sesión
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

async function verRespuestas(sesionId) {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log(`RESPUESTAS DE LA SESIÓN ${sesionId}`);
    console.log('='.repeat(80));
    console.log('');

    // Obtener mensajes con preguntas y respuestas
    const [mensajes] = await pool.query(`
      SELECT
        m.id,
        m.tipo,
        m.contenido,
        m.created_at,
        p.id as pregunta_id,
        p.pregunta,
        p.tipo_campo,
        p.es_eliminatoria,
        p.peso,
        e.cumple,
        e.puntaje,
        e.razon,
        e.metodo_evaluacion,
        e.detalles
      FROM cb_mensajes m
      LEFT JOIN cb_preguntas p ON m.pregunta_id = p.id
      LEFT JOIN cb_evaluaciones e ON e.mensaje_id = m.id
      WHERE m.sesion_id = ?
      ORDER BY m.created_at ASC
    `, [sesionId]);

    let preguntaActual = null;

    mensajes.forEach((msg, index) => {
      if (msg.tipo === 'pregunta') {
        preguntaActual = msg;
        console.log(`\n${'='.repeat(80)}`);
        console.log(`PREGUNTA ${msg.pregunta_id}:`);
        console.log(`Texto: ${msg.pregunta}`);
        console.log(`Tipo: ${msg.tipo_campo}`);
        console.log(`Eliminatoria: ${msg.es_eliminatoria ? 'SÍ' : 'NO'}`);
        console.log(`Peso: ${msg.peso}`);
      } else if (msg.tipo === 'respuesta') {
        console.log(`\nRESPUESTA DEL CANDIDATO:`);
        console.log(`"${msg.contenido}"`);
        
        if (msg.cumple !== null) {
          console.log(`\nEVALUACIÓN:`);
          console.log(`Cumple: ${msg.cumple === 1 ? '✓ SÍ' : '✗ NO'}`);
          console.log(`Puntaje: ${msg.puntaje}/100`);
          console.log(`Método: ${msg.metodo_evaluacion}`);
          console.log(`Razón: ${msg.razon || 'Sin razón'}`);
          
          if (msg.detalles) {
            try {
              const detalles = typeof msg.detalles === 'string' ? JSON.parse(msg.detalles) : msg.detalles;
              console.log(`Detalles:`, JSON.stringify(detalles, null, 2));
            } catch (e) {
              console.log(`Detalles: ${msg.detalles}`);
            }
          }
        } else {
          console.log(`\n⚠️  NO HAY EVALUACIÓN REGISTRADA`);
        }
      }
    });

    console.log('\n' + '='.repeat(80));

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

const sesionId = process.argv[2];

if (!sesionId) {
  console.log('');
  console.log('USO: node ver-respuestas.js <sesion_id>');
  console.log('');
  process.exit(1);
}

verRespuestas(parseInt(sesionId));
