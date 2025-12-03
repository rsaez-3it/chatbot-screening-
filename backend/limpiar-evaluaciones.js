require('dotenv').config();
const {getPool,closePool}=require('./src/config/database');

(async()=>{
  const p=await getPool();
  
  // Eliminar evaluaciones con error
  await p.query("DELETE FROM cb_evaluaciones WHERE sesion_id=17 AND razon LIKE '%Error%'");
  console.log('✅ Evaluaciones con error eliminadas');
  
  // Mantener solo las últimas evaluaciones por pregunta
  await p.query(`
    DELETE e1 FROM cb_evaluaciones e1
    INNER JOIN cb_evaluaciones e2 
    WHERE e1.sesion_id = 17 
      AND e2.sesion_id = 17
      AND e1.pregunta_id = e2.pregunta_id
      AND e1.id < e2.id
  `);
  console.log('✅ Evaluaciones duplicadas eliminadas');
  
  const [result] = await p.query('SELECT COUNT(*) as total FROM cb_evaluaciones WHERE sesion_id=17');
  console.log(`📊 Evaluaciones restantes: ${result[0].total}`);
  
  await closePool();
})();
