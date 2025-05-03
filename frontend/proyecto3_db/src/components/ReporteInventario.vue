<template>
  <div class="reporte">
    <h2>Inventario</h2>
    <form class="filtros">
      <label>Nombre del ingrediente:
        <select v-model="filtroIngrediente">
          <option value="">Todos</option>
          <option v-for="i in ingredientesDummy" :key="i" :value="i">{{ i }}</option>
        </select>
      </label>
      <label>Lote:
        <select v-model="filtroLote">
          <option value="">Todos</option>
          <option v-for="l in lotesDummy" :key="l" :value="l">{{ l }}</option>
        </select>
      </label>
      <label>Disponibilidad:
        <select v-model="filtroDisponibilidad">
          <option value="">Todas</option>
          <option value="Disponible">Disponible</option>
          <option value="No disponible">No disponible</option>
        </select>
      </label>
      <label>Nombre producto:
        <select v-model="filtroProducto">
          <option value="">Todos</option>
          <option v-for="p in productosDummy" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda" title="Filtre por ingrediente, lote, disponibilidad y producto. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla" id="tabla-inventario">
      <thead>
        <tr>
          <th>ID Ingrediente</th>
          <th>Nombre de Ingrediente</th>
          <th>Cantidad Disponible</th>
          <th>Lote</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventarioFiltrado" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.ingrediente }}</td>
          <td>{{ item.cantidad || 100 }}</td>
          <td>{{ item.lote }}</td>
        </tr>
      </tbody>
    </table>
    <div class="grafica-container">
      <BarChart :chart-data="chartData" :options="chartOptions" />
    </div>
    <div class="totales">
      <span><b>Total productos en página:</b> {{ inventarioFiltrado.length }}</span>
      <span class="leyenda">
        <b>Leyenda:</b>
        <span class="leyenda-estado leyenda-optimo"></span> Óptimo
        <span class="leyenda-estado leyenda-bajo"></span> Bajo
        <span class="leyenda-estado leyenda-critico"></span> Crítico
      </span>
    </div>
    <div class="paginacion">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }}</span>
      <button :disabled="inventarioFiltrado.length < porPagina" @click="pagina++">Siguiente</button>
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
  name: 'ReporteInventario',
  components: { BarChart },
  data() {
    return {
      filtroIngrediente: '',
      filtroLote: '',
      filtroDisponibilidad: '',
      filtroProducto: '',
      pagina: 1,
      porPagina: 10,
      productosDummy: ['Café', 'Leche', 'Azúcar', 'Vasos'],
      ingredientesDummy: ['Grano', 'Leche', 'Azúcar', 'Cartón'],
      lotesDummy: ['Lote 1', 'Lote 2', 'Lote 3'],
      inventario: [],
      chartData: null,
      chartOptions: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    };
  },
  computed: {
    inventarioFiltrado() {
      const start = (this.pagina - 1) * this.porPagina;
      return this.inventario.slice(start, start + this.porPagina);
    }
  },
  methods: {
    async fetchInventario() {
      const res = await fetch('/api/reportes/inventario');
      this.inventario = await res.json();
    },
    async buscar() {
      this.pagina = 1;
      await this.fetchInventario();
    },
    exportarPDF() {
      import('html2pdf.js').then(html2pdf => {
        const element = document.getElementById('tabla-inventario');
        html2pdf.default().from(element).save('reporte_inventario.pdf');
      });
    },
    exportarExcel() {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.table_to_sheet(document.getElementById('tabla-inventario'));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Inventario');
        XLSX.writeFile(wb, 'reporte_inventario.xlsx');
      });
    },
    refrescar() {
      this.filtroProducto = '';
      this.filtroIngrediente = '';
      this.filtroDisponibilidad = '';
      this.filtroLote = '';
      this.pagina = 1;
    },
    updateChart() {
      if (!this.inventario.length) {
        this.chartData = null;
        return;
      }
      const labels = this.inventario.map(i => i.ingrediente);
      const data = this.inventario.map(i => i.cantidad);
      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Cantidad disponible',
            backgroundColor: '#42b983',
            data
          }
        ]
      };
    }
  },
  async mounted() {
    await this.fetchInventario();
    this.updateChart();
  },
  watch: {
    inventarioFiltrado: {
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
.leyenda-optimo { background: #42b983; }
.leyenda-bajo { background: #f7b731; }
.leyenda-critico { background: #eb3b5a; }
.estado-óptimo td { background: #eaffea; }
.estado-bajo td { background: #fffbe6; }
.estado-critico td { background: #ffeaea; }
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
