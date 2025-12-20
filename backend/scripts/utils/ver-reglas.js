/**
 * Script para ver las reglas de las preguntas
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

async function verReglas(configId) {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log(`REGLAS DE LAS PREGUNTAS DEL CHATBOT ${configId}`);
    console.log('='.repeat(80));
    console.log('');

    const [preguntas] = await pool.query(`
      SELECT
        id,
        pregunta,
        tipo_campo,
        metodo_evaluacion,
        regla,
        peso,
        es_eliminatoria
      FROM cb_preguntas
      WHERE config_id = ?
      ORDER BY orden ASC
    `, [configId]);

    preguntas.forEach((p, index) => {
      console.log(`\n${index + 1}. PREGUNTA ID ${p.id}:`);
      console.log(`   Texto: ${p.pregunta}`);
      console.log(`   Tipo: ${p.tipo_campo}`);
      console.log(`   Método: ${p.metodo_evaluacion}`);
      console.log(`   Peso: ${p.peso}`);
      console.log(`   Eliminatoria: ${p.es_eliminatoria ? 'SÍ' : 'NO'}`);
      console.log(`   Regla (raw):`);
      console.log(`   ${p.regla}`);
      
      if (p.regla) {
        try {
          const regla = typeof p.regla === 'string' ? JSON.parse(p.regla) : p.regla;
          console.log(`   Regla (parsed):`);
          console.log(JSON.stringify(regla, null, 4));
        } catch (e) {
          console.log(`   ⚠️  Error al parsear regla: ${e.message}`);
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

const configId = process.argv[2];

if (!configId) {
  console.log('');
  console.log('USO: node ver-reglas.js <config_id>');
  console.log('');
  process.exit(1);
}

verReglas(parseInt(configId));
