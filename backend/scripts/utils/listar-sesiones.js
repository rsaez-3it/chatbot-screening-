/**
 * Script para listar sesiones recientes
 */

require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

async function listarSesiones() {
  let pool;
  try {
    console.log('');
    console.log('='.repeat(80));
    console.log('SESIONES RECIENTES');
    console.log('='.repeat(80));
    console.log('');

    pool = await getPool();
    const [sesiones] = await pool.query(`
      SELECT
        s.id,
        s.token,
        s.estado,
        s.resultado,
        s.puntaje_total,
        s.porcentaje,
        s.candidato_nombre,
        s.candidato_email,
        s.created_at,
        s.fecha_completado,
        c.nombre as chatbot_nombre,
        c.umbral_aprobacion
      FROM cb_sesiones s
      INNER JOIN cb_config c ON s.config_id = c.id
      ORDER BY s.created_at DESC
      LIMIT 10
    `);

    if (sesiones.length === 0) {
      console.log('No hay sesiones registradas');
      await closePool();
      return;
    }

    sesiones.forEach((sesion, index) => {
      console.log(`${index + 1}. Sesión ID: ${sesion.id}`);
      console.log(`   Token: ${sesion.token.substring(0, 20)}...`);
      console.log(`   Chatbot: ${sesion.chatbot_nombre}`);
      console.log(`   Candidato: ${sesion.candidato_nombre || 'Sin nombre'} (${sesion.candidato_email || 'Sin email'})`);
      console.log(`   Estado: ${sesion.estado}`);
      console.log(`   Resultado: ${sesion.resultado}`);
      console.log(`   Puntaje: ${sesion.puntaje_total} (${sesion.porcentaje}%)`);
      console.log(`   Umbral: ${sesion.umbral_aprobacion}%`);
      console.log(`   Creada: ${sesion.created_at}`);
      if (sesion.fecha_completado) {
        console.log(`   Completada: ${sesion.fecha_completado}`);
      }
      console.log('');
    });

    console.log('='.repeat(80));
    console.log('');
    console.log('Para diagnosticar una sesión, ejecuta:');
    console.log('node diagnostico-calculos.js <sesion_id>');
    console.log('');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await closePool();
  }
}

listarSesiones();
