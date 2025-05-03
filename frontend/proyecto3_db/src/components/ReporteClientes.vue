<template>
  <div class="reporte">
    <h2>Clientes Frecuentes</h2>
    <form class="filtros">
      <label>Fecha inicio:
        <input type="date" v-model="fechaInicio" />
      </label>
      <label>Fecha fin:
        <input type="date" v-model="fechaFin" />
      </label>
      <label>Gasto promedio:
        <select v-model="filtroGastoPromedio">
          <option value="">Todos</option>
          <option v-for="g in gastosPromedioDummy" :key="g" :value="g">{{ g }}</option>
        </select>
      </label>
      <label>Pedidos realizados:
        <select v-model="filtroPedidosRealizados">
          <option value="">Todos</option>
          <option v-for="p in pedidosRealizadosDummy" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda" title="Filtre por fecha, gasto promedio y pedidos realizados. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla" id="tabla-clientes">
      <thead>
        <tr>
          <th>ID Cliente</th>
          <th>Nombre Cliente</th>
          <th>Fecha de Registro</th>
          <th>Puntos Fidelización</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
          <td>{{ cliente.id }}</td>
          <td>{{ cliente.nombre }}</td>
          <td>{{ cliente.fecha_registro || cliente.ultima }}</td>
          <td>{{ cliente.puntos }}</td>
        </tr>
      </tbody>
    </table>
    <div class="grafica-container">
      <BarChart :chart-data="chartData" :options="chartOptions" />
    </div>
    <div class="totales">
      <span><b>Total gastado:</b> ${{ totalGeneral.toFixed(2) }}</span>
      <span class="leyenda">
        <b>Leyenda:</b>
        <span class="leyenda-frecuencia leyenda-alta"></span> Alta
        <span class="leyenda-frecuencia leyenda-media"></span> Media
        <span class="leyenda-frecuencia leyenda-baja"></span> Baja
        <span class="leyenda-estado leyenda-activo"></span> Activo
        <span class="leyenda-estado leyenda-inactivo"></span> Inactivo
      </span>
    </div>
    <div class="paginacion">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }}</span>
      <button :disabled="clientesFiltrados.length < porPagina" @click="pagina++">Siguiente</button>
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
  name: 'ReporteClientes',
  components: { BarChart },
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      filtroGastoPromedio: '',
      filtroPedidosRealizados: '',
      pagina: 1,
      porPagina: 10,
      gastosPromedioDummy: [],
      pedidosRealizadosDummy: [],
      clientes: [],
      chartData: null,
      chartOptions: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    };
  },
  computed: {
    clientesFiltrados() {
      const start = (this.pagina - 1) * this.porPagina;
      return this.clientes.slice(start, start + this.porPagina);
    },
    totalGeneral() {
      return this.clientesFiltrados.reduce((acc, c) => acc + c.gasto_promedio, 0);
    }
  },
  methods: {
    async fetchClientes() {
      // Puedes agregar filtros como query params si el backend los soporta
      const res = await fetch('/api/reportes/clientes');
      this.clientes = await res.json();
    },
    async buscar() {
      this.pagina = 1;
      await this.fetchClientes();
    },
    exportarPDF() {
      import('html2pdf.js').then(html2pdf => {
        const element = document.getElementById('tabla-clientes');
        html2pdf.default().from(element).save('reporte_clientes.pdf');
      });
    },
    exportarExcel() {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.table_to_sheet(document.getElementById('tabla-clientes'));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
        XLSX.writeFile(wb, 'reporte_clientes.xlsx');
      });
    },
    refrescar() {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.filtroGastoPromedio = '';
      this.filtroPedidosRealizados = '';
      this.pagina = 1;
    },
    updateChart() {
      // Solo actualiza si hay datos
      if (!this.clientesFiltrados.length) {
        this.chartData = null;
        return;
      }
      const labels = this.clientesFiltrados.map(c => c.nombre);
      const data = this.clientesFiltrados.map(c => c.puntos);
      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Puntos de fidelización',
            backgroundColor: '#42b983',
            data
          }
        ]
      };
    }
  },
  async mounted() {
    await this.fetchClientes();
    this.updateChart();
  },
  watch: {
    clientesFiltrados: {
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
  /* Removed duplicate align-items and justify-content */
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
.leyenda-frecuencia {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}
.leyenda-alta { background: #42b983; }
.leyenda-media { background: #f7b731; }
.leyenda-baja { background: #eb3b5a; }
.leyenda-estado {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}
.leyenda-activo { background: #42b983; }
.leyenda-inactivo { background: #eb3b5a; }
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
.estado-activo td { background: #eaffea; }
.estado-inactivo td { background: #ffeaea; }
</style>
