const cors = require('cors');
const express = require('express');
const app = express();
const PORT = 3030;
const pool = require('./connect_db');

app.use(cors());

app.get('/reporte/ventas', async (req, res) => {
  const { fecha_inicio, fecha_fin, tipo_pedido, metodo_pago } = req.query;
  try {
    const result = await pool.query(
      `
      SELECT p.id_pedido, 
             c.nombre || ' ' || c.apellido AS cliente,
             e.nombre || ' ' || e.apellido AS vendedor,
             p.fecha_hora AS fecha,
             p.total,
             mp.metodo_pago
      FROM pedidos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      JOIN empleados e ON p.id_empleado = e.id_empleado
      JOIN pagos pa ON pa.id_pedido = p.id_pedido
      JOIN metodos_pago mp ON mp.id = pa.id_metodo_pago
      WHERE p.fecha_hora BETWEEN $1 AND $2
        AND ($3 IS NULL OR p.tipo_pedido = $3)
        AND ($4 IS NULL OR mp.metodo_pago = $4)
      ORDER BY p.fecha_hora DESC
      `,
      [
        fecha_inicio,
        fecha_fin,
        tipo_pedido || null,
        metodo_pago || null]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener reporte de ventas:', err);
    res.status(500).send('Error al obtener reporte de ventas');
  }
});

app.get('/reporte/clientes-frecuentes', async (req, res) => {
  const { fecha_inicio, fecha_fin, gasto_promedio, pedidos_realizados } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT 
        c.id_cliente,
        c.nombre || ' ' || c.apellido AS nombre_cliente,
        c.fecha_registro,
        c.puntos_fidelizacion,
        COUNT(p.id_pedido) AS pedidos_realizados,
        ROUND(AVG(p.total), 2) AS gasto_promedio
      FROM clientes c
      JOIN pedidos p ON c.id_cliente = p.id_cliente
      WHERE p.fecha_hora BETWEEN $1 AND $2
      GROUP BY c.id_cliente
      HAVING 
        ($3::numeric IS NULL OR ROUND(AVG(p.total), 2) >= $3)
        AND ($4::int IS NULL OR COUNT(p.id_pedido) >= $4)
      ORDER BY pedidos_realizados DESC
      `,
      [
        fecha_inicio,
        fecha_fin,
        gasto_promedio || null,
        pedidos_realizados || null
      ]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener reporte de clientes frecuentes:', err);
    res.status(500).send('Error al obtener reporte de clientes frecuentes');
  }
});

app.get('/reporte/inventario-ingredientes', async (req, res) => {
  const { nombre_ingrediente, lote, disponibilidad, nombre_producto } = req.query;

  try {

    const result = await pool.query(`
      SELECT DISTINCT
        i.id_ingrediente,
        i.nombre_producto AS nombre_ingrediente,
        i.cantidad AS cantidad_disponible,
        i.lote
      FROM ingredientes i
      LEFT JOIN ingrediente_producto ip ON i.id_ingrediente = ip.id_ingrediente
      LEFT JOIN productos p ON ip.id_producto = p.id_producto
      WHERE 
        ($1::text IS NULL OR i.nombre_producto ILIKE '%' || $1 || '%')
        AND ($2::text IS NULL OR i.lote ILIKE '%' || $2 || '%')
        AND (
          CASE 
            WHEN $3::text = 'disponible' THEN i.cantidad > 0
            WHEN $3::text = 'no disponible' THEN i.cantidad = 0
            ELSE TRUE
          END
        )
        AND ($4::text IS NULL OR p.nombre ILIKE '%' || $4 || '%')
      ORDER BY i.nombre_producto ASC
    `, [
      nombre_ingrediente || null,
      lote || null,
      disponibilidad || null,
      nombre_producto || null
    ]);

    res.json(result.rows);
  } catch (err) {
    console.error('Error en reporte de inventario de ingredientes:', err);
    res.status(500).send('Error al obtener reporte de inventario');
  }
});

app.get('/reporte/pedidos', async (req, res) => {
  const { fecha_inicio, fecha_fin, estado, tipo_pedido } = req.query;

  try {

    const result = await pool.query(
      `
      SELECT 
        p.id_pedido,
        c.nombre || ' ' || c.apellido AS cliente,
        CASE 
          WHEN l.tipo IS NULL THEN 'Pedido para llevar'
          ELSE l.tipo || COALESCE(' ' || l.numero, '')
        END AS localizacion,
        p.fecha_hora,
        p.total
      FROM pedidos p
      JOIN clientes c ON p.id_cliente = c.id_cliente
      LEFT JOIN localizaciones l ON p.id_localizacion = l.id
      WHERE p.fecha_hora BETWEEN $1 AND $2
        AND ($3::estado_pedido_enum IS NULL OR p.estado = $3)
        AND ($4::tipo_pedido_enum IS NULL OR p.tipo_pedido = $4)
      ORDER BY p.fecha_hora DESC
      `,
      [
        fecha_inicio,
        fecha_fin,
        estado || null,
        tipo_pedido || null
      ]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener reporte de pedidos:', err);
    res.status(500).send('Error al obtener reporte de pedidos');
  }
});


app.get('/reporte/productos-mas-vendidos', async (req, res) => {
  const { fecha_inicio, fecha_fin, cantidad_veces_pedido, categoria } = req.query;

  try {
    const result = await pool.query(
      `
      SELECT 
        pr.id_producto,
        pr.nombre,
        pr.precio,
        pr.costo,
        SUM(dp.cantidad) AS veces_pedido
      FROM detalles_pedido dp
      JOIN productos pr ON dp.id_producto = pr.id_producto
      JOIN pedidos p ON dp.id_pedido = p.id_pedido
      LEFT JOIN categorias cat ON pr.id_categoria = cat.id_categoria
      WHERE p.fecha_hora BETWEEN $1 AND $2
        AND ($3::int IS NULL OR cat.id_categoria = $3)
      GROUP BY pr.id_producto, pr.nombre, pr.precio, pr.costo
      HAVING ($4::int IS NULL OR SUM(dp.cantidad) >= $4)
      ORDER BY veces_pedido DESC
      `,
      [
        fecha_inicio,
        fecha_fin,
        categoria || null,
        cantidad_veces_pedido || null
      ]
    );

    res.json(result.rows);
  } catch (err) {
    console.error('Error al obtener reporte de productos más vendidos:', err);
    res.status(500).send('Error al obtener reporte de productos más vendidos');
  }
});



app.listen(PORT, () => {
  console.log(`Servidor backend escuchando en puerto ${PORT}`);
});