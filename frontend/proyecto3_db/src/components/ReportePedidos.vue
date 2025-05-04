<template>
  <div class="reporte">
    <h2>Pedidos</h2>
    <form class="filtros">
      <label>Fecha inicio:
        <input type="date" v-model="fechaInicio" />
      </label>
      <label>Fecha fin:
        <input type="date" v-model="fechaFin" />
      </label>
      <label>Estado:
        <select v-model="filtroEstado">
          <option value="">Todos</option>
          <option v-for="e in estadosDummy" :key="e" :value="e">{{ e }}</option>
        </select>
      </label>
      <label>Tipo de pedido:
        <select v-model="filtroTipoPedido">
          <option value="">Todos</option>
          <option v-for="t in tiposPedidoDummy" :key="t" :value="t">{{ t }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda" title="Filtre por fecha, estado, tipo de pedido. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla" id="tabla-pedidos">
      <thead>
        <tr>
          <th>ID Pedido</th>
          <th>Cliente</th>
          <th>Localización</th>
          <th>Fecha Hora</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pedido in pedidosFiltrados" :key="pedido.id_pedido">
          <td>{{ pedido.id_pedido }}</td>
          <td>{{ pedido.cliente }}</td>
          <td>{{ pedido.localizacion }}</td>
          <td>{{ formatDateTime(pedido.fecha_hora) }}</td>
          <td>${{ Number(pedido.total || 0).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="grafica-container">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
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
import { defineComponent } from 'vue';
import { Bar } from 'vue-chartjs';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
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

const BarChart = defineComponent({
  name: 'ReportePedidos',
  components: { Bar },
  props: {
    chartData: Object,
    options: Object
  },
  watch: {
    chartData: {
      handler() {
        this.render();
      },
      deep: true
    }
  },
  methods: {
    render() {
      this.$refs.barChart.renderChart(this.chartData, this.options);
    }
  },
  mounted() {
    this.render();
  },
  template: `
    <Bar ref="barChart" :chart-data="chartData" :options="options" />
  `
});

export default {
  name: 'ReportePedidos',
  components: { BarChart },
  data() {

    const hoy = new Date();
    const semanaPasada = new Date();
    semanaPasada.setDate(hoy.getDate() - 7);

    return {
      fechaInicio: this.formatDate(semanaPasada),
      fechaFin: this.formatDate(hoy),
      filtroEstado: '',
      filtroTipoPedido: '',
      pagina: 1,
      porPagina: 10,
      estadosDummy: ['Pendiente', 'En preparacion', 'Completado', 'Cancelado'],
      tiposPedidoDummy: ['Local', 'Para llevar', 'Delivery'],
      pedidos: [],
      chartData: null,
      chartOptions: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    };
  },
  computed: {
    pedidosFiltrados() {
      const start = (this.pagina - 1) * this.porPagina;
      return this.pedidos.slice(start, start + this.porPagina);
    }
  },
  methods: {
    formatDate(date) {
      return date.toISOString().split('T')[0];
    },
    formatDateTime(isoString) {
      if (!isoString) return 'N/A';
      return format(new Date(isoString), 'dd-MM-yyyy HH:mm:ss', { locale: es });
    },
    async fetchPedidos() {
      try {
        const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3030';

        const params = new URLSearchParams({
          fecha_inicio: this.fechaInicio || '',
          fecha_fin: this.fechaFin || '',
          estado: this.filtroEstado || '',
          tipo_pedido: this.filtroTipoPedido || ''
        });

        console.log('Parámetros enviados:', params.toString());

        const res = await fetch(`${API_URL}/api/reportes/pedidos?${params.toString()}`);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al cargar pedidos');
        }
        this.pedidos = await res.json();
        this.updateChart();
      } catch (error) {
        console.error('Error en fetchPedidos:', error);
        alert(error.message);
        this.pedidos = [];
      }

    },
    async buscar() {
      this.pagina = 1;
      await this.fetchPedidos();
    },
    exportarPDF() {
      import('html2pdf.js').then(html2pdf => {
        const element = document.getElementById('tabla-pedidos');
        html2pdf.default().from(element).save('reporte_pedidos.pdf');
      });
    },
    exportarExcel() {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.table_to_sheet(document.getElementById('tabla-pedidos'));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');
        XLSX.writeFile(wb, 'reporte_pedidos.xlsx');
      });
    },
    refrescar() {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.filtroEstado = '';
      this.filtroTipoPedido = '';
      this.pagina = 1;
    },
    updateChart() {
      // Solo actualiza si hay datos
      if (!this.pedidos.length) {
        this.chartData = null;
        return;
      }
      // Obtiene los estados únicos de los pedidos reales
      const estados = [...new Set(this.pedidos.map(p => p.estado))];
      const labels = estados;
      const data = labels.map(estado =>
        this.pedidos.filter(p => p.estado === estado).length
      );
      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Cantidad de pedidos',
            backgroundColor: ['#f7b731', '#7ed6df', '#42b983', '#eb3b5a'],
            data
          }
        ]
      };
    }
  },
  async mounted() {
    await this.fetchPedidos();
    this.updateChart();
  },
  watch: {
    pedidosFiltrados: {
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

.tabla th,
.tabla td {
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

.leyenda-pendiente {
  background: #f7b731;
}

.leyenda-en-preparación {
  background: #7ed6df;
}

.leyenda-completado {
  background: #42b983;
}

.leyenda-cancelado {
  background: #eb3b5a;
}

.estado-pendiente td {
  background: #fffbe6;
}

.estado-en-preparación td {
  background: #e6f7fb;
}

.estado-completado td {
  background: #eaffea;
}

.estado-cancelado td {
  background: #ffeaea;
}

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
