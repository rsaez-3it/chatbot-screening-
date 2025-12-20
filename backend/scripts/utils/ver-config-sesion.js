require('dotenv').config();
const { getPool, closePool } = require('./src/config/database');

async function verConfig(sesionId) {
  let pool;
  try {
    pool = await getPool();
    const [sesiones] = await pool.query('SELECT config_id FROM cb_sesiones WHERE id = ?', [sesionId]);
    console.log(`Sesión ${sesionId} tiene config_id: ${sesiones[0]?.config_id}`);
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await closePool();
  }
}

verConfig(parseInt(process.argv[2]));
