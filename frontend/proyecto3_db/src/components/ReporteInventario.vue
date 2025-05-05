<template>
  <div class="reporte">
    <h2>Inventario</h2>
    <form class="filtros">
      <label>Nombre del ingrediente:
        <input type="text" v-model="filtroIngrediente" placeholder="Buscar ingrediente..." />
      </label>
      <label>Lote:
        <input type="text" v-model="filtroLote" placeholder="Buscar lote..." />
      </label>
      <label>Disponibilidad:
        <select v-model="filtroDisponibilidad">
          <option value="">Todas</option>
          <option value="Disponible">Disponible</option>
          <option value="No disponible">No disponible</option>
        </select>
      </label>
      <label>Nombre producto:
        <input type="text" v-model="filtroProducto" placeholder="Buscar producto específico..." />
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda"
        title="Filtre por ingrediente, lote, disponibilidad y producto. Exporte o refresque los datos.">?</span>
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
        <tr v-for="item in inventarioFiltrado" :key="item.id_ingrediente">
          <td>{{ item.id_ingrediente }}</td>
          <td>{{ item.nombre_ingrediente }}</td>
          <td>{{ item.cantidad_disponible }}</td>
          <td>{{ item.lote }}</td>
        </tr>
      </tbody>
    </table>
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
    <div class="grafica-container">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>


<script>
import { defineComponent } from 'vue';
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

const BarChart = defineComponent({
  name: 'ReporteInventario',
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
      try {
        const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3030';

        const params = new URLSearchParams({
          nombre_ingrediente: this.filtroIngrediente || '',
          lote: this.filtroLote || '',
          disponibilidad: this.filtroDisponibilidad || '',
          nombre_producto: this.filtroProducto || ''
        });

        console.log('Parámetros enviados:', params.toString());

        const res = await fetch(`${API_URL}/api/reportes/inventario?${params.toString()}`);


        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al cargar inventario');
        }

        this.inventario = await res.json();
        this.updateChart();

      } catch (error) {
        console.error('Error en fetchInventario:', error);
        alert(error.message);
        this.pedidos = [];
      }

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
      const dataFiltrada = this.inventarioFiltrado;
      const labels = [...new Set(dataFiltrada.map(i => i.nombre_ingrediente))];
      const data = labels.map(ingrediente =>
        dataFiltrada
          .filter(i => i.nombre_ingrediente === ingrediente)
          .reduce((acc, i) => acc + (Number(i.cantidad_disponible) || 0), 0)
      );

      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Cantidad Disponible por Ingrediente',
            backgroundColor: ['#42b983', '#f7b731', '#eb3b5a'],
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
  justify-content: flex-start;
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

.leyenda-optimo {
  background: #42b983;
}

.leyenda-bajo {
  background: #f7b731;
}

.leyenda-critico {
  background: #eb3b5a;
}

.estado-óptimo td {
  background: #eaffea;
}

.estado-bajo td {
  background: #fffbe6;
}

.estado-critico td {
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
