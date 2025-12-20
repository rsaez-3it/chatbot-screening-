/**
 * Script para ver las preguntas de perfil existentes
 */

require('dotenv').config();
const { getPool } = require('./src/config/database');

async function verPreguntasPerfil() {
  const pool = await getPool();

  try {
    console.log('='.repeat(80));
    console.log('🔍 VERIFICANDO PREGUNTAS DE PERFIL');
    console.log('='.repeat(80));
    console.log('');

    // Ver preguntas de perfil
    const [preguntas] = await pool.query(
      'SELECT * FROM cb_preguntas WHERE es_dato_perfil = 1'
    );

    if (preguntas.length === 0) {
      console.log('✅ No hay preguntas de perfil');
      await pool.end();
      return;
    }

    console.log(`📊 Encontradas ${preguntas.length} preguntas de perfil:`);
    console.log('');

    // Agrupar por chatbot
    const porChatbot = {};
    for (const p of preguntas) {
      if (!porChatbot[p.config_id]) {
        porChatbot[p.config_id] = [];
      }
      porChatbot[p.config_id].push(p);
    }

    // Mostrar por chatbot
    for (const [configId, preguntasDelChatbot] of Object.entries(porChatbot)) {
      const [chatbot] = await pool.query(
        'SELECT nombre FROM cb_config WHERE id = ?',
        [configId]
      );
      
      const nombreChatbot = chatbot[0]?.nombre || `ID: ${configId}`;
      console.log(`📌 Chatbot: ${nombreChatbot} (ID: ${configId})`);
      
      preguntasDelChatbot.forEach(p => {
        console.log(`   ID: ${p.id} - ${p.pregunta}`);
        console.log(`   Campo: ${p.campo_perfil}, Orden: ${p.orden}, Activa: ${p.activa}`);
        console.log('');
      });
    }

    console.log('='.repeat(80));
    console.log('💡 Para eliminarlas, ejecuta: node eliminar-preguntas-perfil.js');
    console.log('='.repeat(80));

  } catch (error) {
    console.error('❌ ERROR:', error);
  } finally {
    await pool.end();
  }
}

verPreguntasPerfil();
