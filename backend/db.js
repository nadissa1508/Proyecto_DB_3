const { Pool } = require('pg');

const pool = new Pool({
  user: 'your_user', // Cambia esto por tu usuario de PostgreSQL
  host: 'localhost',
  database: 'your_database', // Cambia esto por el nombre de tu base de datos
  password: 'your_password', // Cambia esto por tu contraseña
  port: 5432,
});

module.exports = pool;
