<template>
  <div class="reporte">
    <h2>Reporte de Ventas</h2>
    <form class="filtros">
      <label>Fecha inicio:
        <input type="date" v-model="fechaInicio" />
      </label>
      <label>Fecha fin:
        <input type="date" v-model="fechaFin" />
      </label>
      <label>Tipo de pedido:
        <select v-model="filtroTipoPedido">
          <option value="">Todos</option>
          <option v-for="t in tiposPedido" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <label>Método de pago:
        <select v-model="filtroMetodoPago">
          <option value="">Todos</option>
          <option v-for="m in metodosPago" :key="m" :value="m">{{ m }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda" title="Filtre por fecha, tipo de pedido y método de pago. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla" id="tabla-ventas">
      <thead>
        <tr>
          <th>ID Pedido</th>
          <th>Cliente</th>
          <th>Vendedor</th>
          <th>Fecha</th>
          <th>Total</th>
          <th>Método de Pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="venta in ventasFiltradas" :key="venta.id">
          <td>{{ venta.id }}</td>
          <td>{{ venta.cliente }}</td>
          <td>{{ venta.vendedor }}</td>
          <td>{{ venta.fecha }}</td>
          <td>${{ venta.total.toFixed(2) }}</td>
          <td>{{ venta.metodo_pago }}</td>
        </tr>
      </tbody>
    </table>
    <div class="grafica-container">
      <BarChart :chart-data="chartData" :options="chartOptions" />
    </div>
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
import { Bar } from 'vue-chartjs';
import {
  Chart as ChartJS,
  Title,
  Tooltip,
  Legend,
  BarElement,
  CategoryScale,
  LinearScale
} from 'chart.js';

ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

const BarChart = {
  name: 'BarChart',
  props: ['chartData', 'options'],
  extends: Bar,
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    chartData: {
      handler(newData) {
        this.renderChart(newData, this.options);
      },
      deep: true
    }
  }
};

export default {
  name: 'ReporteVentas',
  components: { BarChart },
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      filtroTipoPedido: '',
      filtroMetodoPago: '',
      pagina: 1,
      porPagina: 10,
      tiposPedido: ['Local', 'Para llevar', 'Delivery'],
      metodosPago: ['Efectivo', 'Tarjeta', 'Transferencia'],
      ventas: [
        { id: 1, cliente: 'Ana Pérez', vendedor: 'Carlos Ruiz', fecha: '2025-05-01', total: 150, tipo_pedido: 'Local', metodo_pago: 'Efectivo' },
        { id: 2, cliente: 'Luis Gómez', vendedor: 'Sofía Méndez', fecha: '2025-05-02', total: 200, tipo_pedido: 'Para llevar', metodo_pago: 'Tarjeta' },
        { id: 3, cliente: 'Pedro Torres', vendedor: 'Carlos Ruiz', fecha: '2025-05-02', total: 120, tipo_pedido: 'Delivery', metodo_pago: 'Transferencia' },
        { id: 4, cliente: 'María López', vendedor: 'Sofía Méndez', fecha: '2025-05-03', total: 180, tipo_pedido: 'Local', metodo_pago: 'Efectivo' },
        { id: 5, cliente: 'Ana Pérez', vendedor: 'Carlos Ruiz', fecha: '2025-05-03', total: 90, tipo_pedido: 'Para llevar', metodo_pago: 'Tarjeta' },
        // ...más datos de ejemplo
      ],
      chartData: null,
      chartOptions: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
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
    refrescar() {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.filtroTipoPedido = '';
      this.filtroMetodoPago = '';
      this.pagina = 1;
    },
    exportarPDF() {
      import('html2pdf.js').then(html2pdf => {
        const element = document.getElementById('tabla-ventas');
        html2pdf.default().from(element).save('reporte_ventas.pdf');
      });
    },
    exportarExcel() {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.table_to_sheet(document.getElementById('tabla-ventas'));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Ventas');
        XLSX.writeFile(wb, 'reporte_ventas.xlsx');
      });
    },
    updateChart() {
      // Agrupa ventas por método de pago
      const labels = this.metodosPago;
      const data = labels.map(metodo =>
        this.ventasFiltradas.filter(v => v.metodo_pago === metodo).reduce((acc, v) => acc + v.total, 0)
      );
      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Ventas por método de pago',
            backgroundColor: ['#42b983', '#f7b731', '#eb3b5a'],
            data
          }
        ]
      };
    }
  },
  mounted() {
    this.updateChart();
  },
  watch: {
    ventasFiltradas: {
      handler() {
        this.updateChart();
      },
      deep: true
    }
  }
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
