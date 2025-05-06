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
      <label>Gasto mínimo realizado:
        <input type="number" v-model.number="filtroGastoPromedio" min="0" step="0.01">
      </label>
      <label>Pedidos realizados:
        <input type="number" v-model.number="filtroPedidosRealizados" min="0">
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda"
        title="Filtre por fecha, gasto promedio y pedidos realizados. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla" id="tabla-clientes">
      <thead>
        <tr>
          <th>ID Cliente</th>
          <th>Nombre Cliente</th>
          <th>Fecha de Registro</th>
          <th>Puntos Fidelización</th>
          <th>total gastado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientesFiltrados" :key="cliente.id_cliente">
          <td>{{ cliente.id_cliente }}</td>
          <td>{{ cliente.nombre_cliente }}</td>
          <td>{{ formatDateTime(cliente.fecha_registro) }}</td>
          <td>{{ cliente.puntos_fidelizacion }}</td>
          <td>{{ cliente.gasto_promedio }}</td>
        </tr>
      </tbody>
    </table>
    <div class="totales">
      <span><b>Total gastado por todos los clientes:</b> ${{ totalGeneral.toFixed(2) }}</span>
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
    <div class="grafica-container">
      <Bar v-if="chartData" :data="chartData" :options="chartOptions" />
    </div>
  </div>
</template>


<script>

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

export default {
  name: 'ReporteClientes',
  components: { Bar },
  data() {
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);

    return {
      fechaInicio: this.formatDate(mesPasado),
      fechaFin: this.formatDate(hoy),
      filtroGastoPromedio: null,
      filtroPedidosRealizados: null,
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
      return this.clientes.reduce((acc, cliente) => {
        return acc + (Number(cliente.gasto_promedio) || 0);
      }, 0);
    },
    promedioPedidos() {
      if (this.clientes.length === 0) return 0;
      const total = this.clientes.reduce((acc, cliente) => {
        return acc + (Number(cliente.pedidos_realizados) || 0);
      }, 0);
      return (total / this.clientes.length).toFixed(1);
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
    async fetchClientes() {
      try {
        const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3030';

        const params = new URLSearchParams({
          fecha_inicio: this.fechaInicio || '',
          fecha_fin: this.fechaFin || '',
          gasto_promedio: this.filtroGastoPromedio || '',
          pedidos_realizados: this.filtroPedidosRealizados || ''
        });

        console.log("parametros: ", params.toString());

        const res = await fetch(`${API_URL}/api/reportes/clientes?${params.toString()}`);

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({ error: 'Error desconocido' }));
          throw new Error(errorData.error || 'Error al cargar clientes');
        }

        this.clientes = await res.json();
        this.updateChart();
      } catch (error) {
        console.error('Error en fetch clientes :', error);
        alert(error.message);
        this.clientes = [];
      }

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
      const dataFiltrada = this.clientesFiltrados;
      const labels = [...new Set(dataFiltrada.map(c => c.nombre_cliente))];
      const data = labels.map(cliente =>
        dataFiltrada
          .filter(c => c.nombre_cliente === cliente)
          .reduce((acc, c) => acc + (Number(c.gasto_promedio) || 0), 0)
      );

      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Total Gastado por Cliente',
            backgroundColor: ['#42b983', '#f7b731', '#eb3b5a'],
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
  background-color: #f5e0c3; /* Beige tone from the palette */
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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

button {
  background-color: #d9a066; /* Orange tone from the palette */
  color: white;
  border: none;
  border-radius: 8px;
  padding: 0.5rem 1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

button:hover {
  background-color: #b87d4b; /* Darker orange for hover */
  transform: translateY(-2px);
}

button:disabled {
  background-color: #e0e0e0;
  color: #a0a0a0;
  cursor: not-allowed;
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

.leyenda-frecuencia {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}

.leyenda-alta {
  background: #42b983;
}

.leyenda-media {
  background: #f7b731;
}

.leyenda-baja {
  background: #eb3b5a;
}

.leyenda-estado {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}

.leyenda-activo {
  background: #42b983;
}

.leyenda-inactivo {
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
  border: 1px solid #aaa;
  background: #f7f7f7;
  cursor: pointer;
  font-weight: 500;
}

.paginacion button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.estado-activo td {
  background: #eaffea;
}

.estado-inactivo td {
  background: #ffeaea;
}
</style>
