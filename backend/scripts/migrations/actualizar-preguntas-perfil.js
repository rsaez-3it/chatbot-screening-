/**
 * Script para actualizar las preguntas de perfil existentes
 * Agrega los campos es_dato_perfil y campo_perfil
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

async function actualizarPreguntasPerfil(configId) {
  let pool;
  try {
    pool = await getPool();

    console.log('');
    console.log('='.repeat(80));
    console.log(`ACTUALIZANDO PREGUNTAS DE PERFIL DEL CHATBOT ${configId}`);
    console.log('='.repeat(80));
    console.log('');

    // Actualizar preguntas de perfil (orden negativo)
    const [preguntas] = await pool.query(
      'SELECT id, pregunta, orden FROM cb_preguntas WHERE config_id = ? AND orden < 0',
      [configId]
    );

    if (preguntas.length === 0) {
      console.log('⚠️  No hay preguntas de perfil para actualizar');
      await closePool();
      return;
    }

    console.log(`Encontradas ${preguntas.length} preguntas de perfil:`);
    
    for (const pregunta of preguntas) {
      let campo_perfil = null;
      const preguntaLower = pregunta.pregunta.toLowerCase();

      // Detectar el campo según el texto de la pregunta
      if (preguntaLower.includes('nombre')) {
        campo_perfil = 'nombre';
      } else if (preguntaLower.includes('email') || preguntaLower.includes('correo')) {
        campo_perfil = 'email';
      } else if (preguntaLower.includes('teléfono') || preguntaLower.includes('telefono')) {
        campo_perfil = 'telefono';
      }

      if (campo_perfil) {
        await pool.query(
          'UPDATE cb_preguntas SET es_dato_perfil = 1, campo_perfil = ? WHERE id = ?',
          [campo_perfil, pregunta.id]
        );
        console.log(`   ✅ ${pregunta.pregunta} -> campo_perfil: ${campo_perfil}`);
      } else {
        console.log(`   ⚠️  ${pregunta.pregunta} -> No se pudo detectar el campo`);
      }
    }

    console.log('');
    console.log('='.repeat(80));
    console.log('✅ PREGUNTAS DE PERFIL ACTUALIZADAS');
    console.log('='.repeat(80));
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

const configId = process.argv[2];

if (!configId) {
  console.log('');
  console.log('USO: node actualizar-preguntas-perfil.js <config_id>');
  console.log('');
  console.log('Ejemplo: node actualizar-preguntas-perfil.js 12');
  console.log('');
  process.exit(1);
}

actualizarPreguntasPerfil(parseInt(configId));
