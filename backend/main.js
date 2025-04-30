const cors = require('cors'); 
const express = require('express');
const app = express();
const PORT = 3030;
const pool = require('./connect_db');

app.use(cors());

/**esto es una prueba, se puede borrar */
(async () => {
  try {
    // Ejecuta una simple consulta para forzar la conexión
    const result = await pool.query('SELECT NOW()');
    console.log('🕒 Resultado de prueba:', result.rows[0]);
  } catch (err) {
    console.error('❌ Error al ejecutar la prueba:', err);
  } finally {
    await pool.end(); // Cierra el pool
  }
})();

app.get('/', (req, res) => {
  res.send('¡Hola desde el backend Node.js!');
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
