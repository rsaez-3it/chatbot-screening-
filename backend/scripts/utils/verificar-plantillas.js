require('dotenv').config();
const {getPool,closePool}=require('./src/config/database');

(async()=>{
  const p=await getPool();
  const [r]=await p.query('SELECT * FROM cb_email_templates');
  console.log('Plantillas en BD:', r.length);
  r.forEach(t=>console.log(`  - ${t.codigo}: activa=${t.activa}, nombre=${t.nombre}`));
  await closePool();
})();
