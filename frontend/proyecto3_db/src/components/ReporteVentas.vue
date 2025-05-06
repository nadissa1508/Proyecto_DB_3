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
      <label>Mensuales:
        <select v-model="filtroMensuales">
          <option value="">Todos</option>
          <option v-for="mes in meses" :key="mes.value" :value="mes.value">{{ mes.label }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda"
        title="Filtre por fecha, tipo de pedido y método de pago. Exporte o refresque los datos.">?</span>
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
          <td>{{ venta.id_pedido }}</td>
          <td>{{ venta.cliente }}</td>
          <td>{{ venta.vendedor }}</td>
          <td>{{ venta.fecha }}</td>
          <td>${{ Number(venta.total).toFixed(2) }}</td>
          <td>{{ venta.metodo_pago }}</td>
        </tr>
      </tbody>
    </table>
    <div class="totales">
      <span><b>Total general:</b> ${{ totalGeneral.toFixed(2) }}</span>
      <span><b>Total de ventas:</b> {{ ventasFiltradas.length }}</span>
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
    <div class="grafica-container">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
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

export default {
  name: 'ReporteVentas',
  components: { Bar },
  data() {
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);
    return {
      fechaInicio: this.formatDate(mesPasado),
      fechaFin: this.formatDate(hoy),
      filtroTipoPedido: '',
      filtroMetodoPago: '',
      filtroMensuales: '',
      pagina: 1,
      porPagina: 10,
      tiposPedido: ['Local', 'Para llevar', 'Delivery'],
      metodosPago: ['Efectivo', 'Tarjeta', 'Transferencia'],
      meses: [
        { value: '01', label: 'Enero' },
        { value: '02', label: 'Febrero' },
        { value: '03', label: 'Marzo' },
        { value: '04', label: 'Abril' },
        { value: '05', label: 'Mayo' },
        { value: '06', label: 'Junio' },
        { value: '07', label: 'Julio' },
        { value: '08', label: 'Agosto' },
        { value: '09', label: 'Septiembre' },
        { value: '10', label: 'Octubre' },
        { value: '11', label: 'Noviembre' },
        { value: '12', label: 'Diciembre' }
      ],
      ventas: [],
      chartData: null,
      chartOptions: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    };
  },
  computed: {
    ventasFiltradas() {
      let filtradas = this.ventas;

      if (this.fechaInicio) {
        filtradas = filtradas.filter(v => v.fecha >= this.fechaInicio);
      }
      if (this.fechaFin) {
        filtradas = filtradas.filter(v => v.fecha <= this.fechaFin);
      }
      if (this.filtroTipoPedido) {
        filtradas = filtradas.filter(v => v.tipo_pedido === this.filtroTipoPedido);
      }
      if (this.filtroMetodoPago) {
        filtradas = filtradas.filter(v => v.metodo_pago === this.filtroMetodoPago);
      }
      if (this.filtroMensuales) {
        filtradas = filtradas.filter(v => new Date(v.fecha).getMonth() + 1 === Number(this.filtroMensuales));
      }

      const start = (this.pagina - 1) * this.porPagina;
      return filtradas.slice(start, start + this.porPagina);
    },

    totalGeneral() {
      return this.ventasFiltradas.reduce((acc, v) => acc + (Number(v.total) || 0), 0); // Ensure `total` is a number
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      return date.toISOString().split('T')[0];
    },
    async fetchVentas() {
      try {
        const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3030';

        const params = new URLSearchParams({
          fecha_inicio: this.fechaInicio || new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0],
          fecha_fin: this.fechaFin || new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).toISOString().split('T')[0]
        });

        const res = await fetch(`${API_URL}/api/reportes/ventas?${params.toString()}`);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al cargar ventas');
        }

        const data = await res.json();
        this.ventas = Array.isArray(data) ? data : []; // Ensure `ventas` is an array
        this.updateChart();
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        this.ventas = [];
      }
    },
    async buscar() {
      this.pagina = 1;
      await this.fetchVentas();
    },
    refrescar() {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.filtroTipoPedido = '';
      this.filtroMetodoPago = '';
      this.filtroMensuales = '';
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
      const dataFiltrada = this.ventasFiltradas;
      const labels = [...new Set(dataFiltrada.map(v => v.metodo_pago))];
      const data = labels.map(metodo =>
        dataFiltrada
          .filter(v => v.metodo_pago === metodo)
          .reduce((acc, v) => acc + (Number(v.total) || 0), 0)
      );

      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Total por Método de Pago',
            backgroundColor: ['#42b983', '#f7b731', '#eb3b5a'],
            data
          }
        ]
      };
    }
  },
  async mounted() {
    await this.fetchVentas();
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
  justify-content: flex-start;
  max-width: 900px;
  width: 100%;
  background-color: #f5e0c3; /* Beige tone from the palette */
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

.leyenda-completado {
  background: #42b983;
}

.leyenda-cancelado {
  background: #eb3b5a;
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
  border: none;
  background-color: #d9a066; /* Orange tone from the palette */
  color: white;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.paginacion button:hover {
  background-color: #b87d4b; /* Darker orange for hover */
  transform: translateY(-2px);
}

.paginacion button:disabled {
  background-color: #e0e0e0;
  color: #a0a0a0;
  cursor: not-allowed;
}

.estado-pendiente td {
  background: #fffbe6;
}

.estado-completado td {
  background: #eaffea;
}

.estado-cancelado td {
  background: #ffeaea;
}
</style>
