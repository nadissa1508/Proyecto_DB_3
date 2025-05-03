<template>
  <div class="reporte">
    <h2>Reporte de Ventas</h2>
    <form class="filtros">
      <label>Desde:
        <input type="date" v-model="fechaInicio" />
      </label>
      <label>Hasta:
        <input type="date" v-model="fechaFin" />
      </label>
      <label>Tipo de Pedido:
        <select v-model="filtroTipoPedido">
          <option value="">Todos</option>
          <option v-for="t in tiposPedido" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <label>Método de Pago:
        <select v-model="filtroMetodoPago">
          <option value="">Todos</option>
          <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportar">Exportar</button>
      <span class="ayuda" title="Filtre por fecha, método, cajero y estado. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Total Ventas</th>
          <th>Tipo de Pedido</th>
          <th>Método de Pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="venta in ventasFiltradas" :key="venta.id">
          <td>{{ venta.fecha }}</td>
          <td>${{ venta.total.toFixed(2) }}</td>
          <td>{{ venta.tipo_pedido }}</td>
          <td>{{ venta.metodo_pago }}</td>
        </tr>
      </tbody>
    </table>
    <div class="totales">
      <span><b>Total general:</b> ${{ totalGeneral.toFixed(2) }}</span>
      <span class="leyenda">
        <b>Leyenda:</b>
        <span class="leyenda-estado leyenda-pendiente"></span> Pendiente
        <span class="leyenda-estado leyenda-completado"></span> Completado
        <span class="leyenda-estado leyenda-cancelado"></span> Cancelado
      </span>
    </div>
    <div class="paginacion">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }}</span>
      <button :disabled="ventasFiltradas.length < porPagina" @click="pagina++">Siguiente</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReporteVentas',
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      filtroTipoPedido: '',
      filtroMetodoPago: '',
      pagina: 1,
      porPagina: 10,
      tiposPedido: ['Local', 'Para llevar', 'Delivery'],
      metodosPago: ['Efectivo', 'Tarjeta', 'Transferencia', 'QR'],
      ventas: [
        { id: 1, fecha: '2025-05-01', total: 150, tipo_pedido: 'Local', metodo_pago: 'Efectivo' },
        { id: 2, fecha: '2025-05-02', total: 200, tipo_pedido: 'Para llevar', metodo_pago: 'Tarjeta' },
        { id: 3, fecha: '2025-05-02', total: 120, tipo_pedido: 'Delivery', metodo_pago: 'QR' },
        { id: 4, fecha: '2025-05-03', total: 180, tipo_pedido: 'Local', metodo_pago: 'Efectivo' },
        { id: 5, fecha: '2025-05-03', total: 90, tipo_pedido: 'Para llevar', metodo_pago: 'Tarjeta' },
        // ...más datos de ejemplo
      ],
    };
  },
  computed: {
    ventasFiltradas() {
      let filtradas = this.ventas.filter(v => {
        const fechaOk = (!this.fechaInicio || v.fecha >= this.fechaInicio) && (!this.fechaFin || v.fecha <= this.fechaFin);
        const tipoOk = !this.filtroTipoPedido || v.tipo_pedido === this.filtroTipoPedido;
        const metodoOk = !this.filtroMetodoPago || v.metodo_pago === this.filtroMetodoPago;
        return fechaOk && tipoOk && metodoOk;
      });
      // paginación
      const start = (this.pagina - 1) * this.porPagina;
      return filtradas.slice(start, start + this.porPagina);
    },
    totalGeneral() {
      return this.ventasFiltradas.reduce((acc, v) => acc + v.total, 0);
    }
  },
  methods: {
    buscar() {
      this.pagina = 1;
    },
    exportar() {
      alert('Función de exportar no implementada (demo)');
    },
    refrescar() {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.filtroMetodoPago = '';
      this.filtroCajero = '';
      this.filtroEstado = '';
      this.pagina = 1;
    }
  },
};
</script>

<style scoped>
body, .reporte {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
body, .reporte {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.reporte {
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  padding: 2rem 2rem 1.5rem 2rem;
  margin: 2rem auto;
  align-items: center;
  justify-content: center;
}
.filtros {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1.5rem;
  justify-content: center;
  align-items: center;
}
.filtros label {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-weight: 500;
}
.ayuda {
  background: #42b983;
  color: #fff;
  border-radius: 50%;
  width: 1.5rem;
  height: 1.5rem;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  margin-left: 0.5rem;
  cursor: pointer;
}
.tabla {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 1rem;
  background: #fafbfc;
}
.tabla th, .tabla td {
  border: 1px solid #ccc;
  padding: 0.7rem;
  text-align: center;
}
.tabla th {
  background: #f0f0f0;
}
.leyenda {
  margin-left: 2rem;
  font-size: 0.95rem;
}
.leyenda-estado {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}
.leyenda-pendiente { background: #f7b731; }
.leyenda-completado { background: #42b983; }
.leyenda-cancelado { background: #eb3b5a; }
.totales {
  text-align: right;
  margin-bottom: 1rem;
  font-size: 1.1rem;
}
.paginacion {
  display: flex;
  gap: 1rem;
  justify-content: center;
  align-items: center;
}
.paginacion button {
  padding: 0.3rem 1.2rem;
  border-radius: 6px;
  border: 1px solid #aaa;
  background: #f7f7f7;
  cursor: pointer;
  font-weight: 500;
}
.paginacion button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.estado-pendiente td { background: #fffbe6; }
.estado-completado td { background: #eaffea; }
.estado-cancelado td { background: #ffeaea; }
</style>
