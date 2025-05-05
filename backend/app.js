const express = require('express');
const app = express();
const pool = require('./db'); // Asegúrate de tener configurada la conexión a la base de datos

// Reporte 1: Inventario de ingredientes
app.get('/reporte/inventario', async (req, res) => {
  const { nombreIngrediente, lote, disponibilidad, nombreProducto } = req.query;
  const query = `
    SELECT * FROM reporte_inventario_ingredientes($1, $2, $3, $4);
  `;
  const values = [nombreIngrediente || null, lote || null, disponibilidad || null, nombreProducto || null];
  const result = await pool.query(query, values);
  res.json(result.rows);
});

// Reporte 2: Pedidos
app.get('/reporte/pedidos', async (req, res) => {
  const { fechaInicio, fechaFin, estado, tipoPedido } = req.query;
  const query = `
    SELECT * FROM reporte_pedidos($1, $2, $3, $4);
  `;
  const values = [fechaInicio || null, fechaFin || null, estado || null, tipoPedido || null];
  const result = await pool.query(query, values);
  res.json(result.rows);
});

// Reporte 3: Productos más vendidos
app.get('/reporte/productos-mas-vendidos', async (req, res) => {
  const { fechaInicio, fechaFin, cantidad, categoria } = req.query;
  const query = `
    SELECT * FROM reporte_productos_mas_vendidos($1, $2, $3, $4);
  `;
  const values = [fechaInicio || null, fechaFin || null, cantidad || null, categoria || null];
  const result = await pool.query(query, values);
  res.json(result.rows);
});

// Reporte 4: Ventas
app.get('/reporte/ventas', async (req, res) => {
  const { fechaInicio, fechaFin, estado, montoMinimo } = req.query;
  console.log('Filters:', { fechaInicio, fechaFin, estado, montoMinimo }); // Log filters

  const query = `
    SELECT * FROM reporte_ventas($1, $2, $3, $4);
  `;
  const values = [fechaInicio || null, fechaFin || null, estado || null, montoMinimo || null];
  console.log('Query Values:', values); // Log query values

  try {
    const result = await pool.query(query, values);
    console.log('Query Result:', result.rows); // Log database response
    res.json(result.rows);
  } catch (error) {
    console.error('Database Error:', error); // Log any errors
    res.status(500).send('Error fetching data');
  }
});

module.exports = app;