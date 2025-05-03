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

// --- Reportes API ---
// Clientes frecuentes
app.get('/api/reportes/clientes', (req, res) => {
  // TODO: Reemplazar con consulta real a la base de datos
  res.json([
    { id: 1, nombre: 'Ana Pérez', fecha_registro: '2024-01-10', puntos: 50, gasto_promedio: 500, pedidos_realizados: 12 },
    { id: 2, nombre: 'Luis Gómez', fecha_registro: '2024-02-15', puntos: 30, gasto_promedio: 350, pedidos_realizados: 9 },
    { id: 3, nombre: 'Pedro Torres', fecha_registro: '2024-03-20', puntos: 10, gasto_promedio: 210, pedidos_realizados: 7 },
    { id: 4, nombre: 'María López', fecha_registro: '2024-04-05', puntos: 20, gasto_promedio: 150, pedidos_realizados: 5 }
  ]);
});

// Pedidos
app.get('/api/reportes/pedidos', (req, res) => {
  // TODO: Reemplazar con consulta real a la base de datos
  res.json([
    { id: 101, cliente: 'Ana Pérez', localizacion: 'Sucursal Centro', fecha_hora: '2025-05-01 10:00', total: 50, tipo_pedido: 'Local', estado: 'Completado' },
    { id: 102, cliente: 'Luis Gómez', localizacion: 'Sucursal Norte', fecha_hora: '2025-05-02 11:00', total: 80, tipo_pedido: 'Para llevar', estado: 'Pendiente' },
    { id: 103, cliente: 'Pedro Torres', localizacion: 'Sucursal Centro', fecha_hora: '2025-05-02 12:00', total: 60, tipo_pedido: 'Delivery', estado: 'En preparación' },
    { id: 104, cliente: 'María López', localizacion: 'Sucursal Sur', fecha_hora: '2025-05-03 13:00', total: 40, tipo_pedido: 'Local', estado: 'Cancelado' }
  ]);
});

// Productos más vendidos
app.get('/api/reportes/productos', (req, res) => {
  // TODO: Reemplazar con consulta real a la base de datos
  res.json([
    { id: 1, nombre: 'Café Americano', categoria: 'Bebida', cantidad: 120, ingresos: 1800, precio: 15, costo: 9 },
    { id: 2, nombre: 'Capuchino', categoria: 'Bebida', cantidad: 90, ingresos: 1350, precio: 15, costo: 9 },
    { id: 3, nombre: 'Latte', categoria: 'Bebida', cantidad: 70, ingresos: 1050, precio: 15, costo: 9 },
    { id: 4, nombre: 'Té Verde', categoria: 'Otro', cantidad: 40, ingresos: 400, precio: 10, costo: 6 }
  ]);
});

// Inventario
app.get('/api/reportes/inventario', (req, res) => {
  // TODO: Reemplazar con consulta real a la base de datos
  res.json([
    { id: 1, producto: 'Café', ingrediente: 'Grano', disponibilidad: 'Disponible', lote: 'Lote 1', cantidad: 120 },
    { id: 2, producto: 'Leche', ingrediente: 'Leche', disponibilidad: 'No disponible', lote: 'Lote 2', cantidad: 80 },
    { id: 3, producto: 'Azúcar', ingrediente: 'Azúcar', disponibilidad: 'Disponible', lote: 'Lote 3', cantidad: 60 },
    { id: 4, producto: 'Vasos', ingrediente: 'Cartón', disponibilidad: 'Disponible', lote: 'Lote 1', cantidad: 200 }
  ]);
});

// Ventas
app.get('/api/reportes/ventas', (req, res) => {
  // TODO: Reemplazar con consulta real a la base de datos
  res.json([
    { id: 1, cliente: 'Ana Pérez', vendedor: 'Carlos Ruiz', fecha: '2025-05-01', total: 150, tipo_pedido: 'Local', metodo_pago: 'Efectivo' },
    { id: 2, cliente: 'Luis Gómez', vendedor: 'Sofía Méndez', fecha: '2025-05-02', total: 200, tipo_pedido: 'Para llevar', metodo_pago: 'Tarjeta' },
    { id: 3, cliente: 'Pedro Torres', vendedor: 'Carlos Ruiz', fecha: '2025-05-02', total: 120, tipo_pedido: 'Delivery', metodo_pago: 'Transferencia' },
    { id: 4, cliente: 'María López', vendedor: 'Sofía Méndez', fecha: '2025-05-03', total: 180, tipo_pedido: 'Local', metodo_pago: 'Efectivo' },
    { id: 5, cliente: 'Ana Pérez', vendedor: 'Carlos Ruiz', fecha: '2025-05-03', total: 90, tipo_pedido: 'Para llevar', metodo_pago: 'Tarjeta' }
  ]);
});

app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});
