<template>
  <div class="reporte">
    <h2>Pedidos</h2>
    <form class="filtros">
      <label>Desde: <input type="date" v-model="fechaInicio" /></label>
      <label>Hasta: <input type="date" v-model="fechaFin" /></label>
      <label>Estado:
        <select v-model="filtroEstado">
          <option value="">Todos</option>
          <option v-for="e in estadosDummy" :key="e" :value="e">{{ e }}</option>
        </select>
      </label>
      <label>Tipo de Pedido:
        <select v-model="filtroTipoPedido">
          <option value="">Todos</option>
          <option v-for="t in tiposPedidoDummy" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportar">Exportar</button>
      <span class="ayuda" title="Filtre por fecha, estado, cliente, método de pago y cajero. Exporte, refresque o consulte la leyenda de estados.">?</span>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>ID Pedido</th>
          <th>Fecha</th>
          <th>Tipo de Pedido</th>
          <th>Estado</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pedido in pedidosFiltrados" :key="pedido.id" :class="'estado-' + pedido.estado.toLowerCase().replace(/ /g, '-')">
          <td>{{ pedido.id }}</td>
          <td>{{ pedido.fecha }}</td>
          <td>{{ pedido.tipo_pedido }}</td>
          <td>
            <span :title="pedido.estado">
              <span :class="'leyenda-estado leyenda-' + pedido.estado.toLowerCase().replace(/ /g, '-')"></span>
              {{ pedido.estado }}
            </span>
          </td>
          <td>${{ pedido.total.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="totales">
      <span><b>Total pedidos en página:</b> {{ pedidosFiltrados.length }}</span>
      <span class="leyenda">
        <b>Leyenda:</b>
        <span class="leyenda-estado leyenda-pendiente"></span> Pendiente
        <span class="leyenda-estado leyenda-en-preparación"></span> En preparación
        <span class="leyenda-estado leyenda-completado"></span> Completado
        <span class="leyenda-estado leyenda-cancelado"></span> Cancelado
      </span>
    </div>
    <div class="paginacion">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }}</span>
      <button :disabled="pedidosFiltrados.length < porPagina" @click="pagina++">Siguiente</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportePedidos',
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      filtroEstado: '',
      filtroTipoPedido: '',
      pagina: 1,
      porPagina: 10,
      estadosDummy: ['Pendiente', 'En preparación', 'Completado', 'Cancelado'],
      tiposPedidoDummy: ['Local', 'Para llevar', 'Delivery'],
      pedidos: [
        { id: 101, fecha: '2025-05-01', tipo_pedido: 'Local', estado: 'Completado', total: 50 },
        { id: 102, fecha: '2025-05-02', tipo_pedido: 'Para llevar', estado: 'Pendiente', total: 80 },
        { id: 103, fecha: '2025-05-02', tipo_pedido: 'Delivery', estado: 'En preparación', total: 60 },
        { id: 104, fecha: '2025-05-03', tipo_pedido: 'Local', estado: 'Cancelado', total: 40 },
        // ...más datos de ejemplo
      ],
    };
  },
  computed: {
    pedidosFiltrados() {
      let filtrados = this.pedidos.filter(p => {
        const fechaOk = (!this.fechaInicio || p.fecha >= this.fechaInicio) && (!this.fechaFin || p.fecha <= this.fechaFin);
        const estadoOk = !this.filtroEstado || p.estado === this.filtroEstado;
        const tipoOk = !this.filtroTipoPedido || p.tipo_pedido === this.filtroTipoPedido;
        return fechaOk && estadoOk && tipoOk;
      });
      const start = (this.pagina - 1) * this.porPagina;
      return filtrados.slice(start, start + this.porPagina);
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
      this.filtroEstado = '';
      this.filtroTipoPedido = '';
      this.pagina = 1;
    }
  },
};
</script>

<style scoped>
.reporte {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  max-width: 900px;
  width: 100%;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px #0001;
  padding: 2rem 2rem 1.5rem 2rem;
  margin: 2rem auto;
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
.leyenda-en-preparación { background: #7ed6df; }
.leyenda-completado { background: #42b983; }
.leyenda-cancelado { background: #eb3b5a; }
.estado-pendiente td { background: #fffbe6; }
.estado-en-preparación td { background: #e6f7fb; }
.estado-completado td { background: #eaffea; }
.estado-cancelado td { background: #ffeaea; }
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
</style>
