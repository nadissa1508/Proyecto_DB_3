<template>
  <div class="reporte">
    <h2>Productos Más Vendidos</h2>
    <form class="filtros">
      <label>Fecha inicio:
        <input type="date" v-model="fechaInicio" />
      </label>
      <label>Fecha fin:
        <input type="date" v-model="fechaFin" />
      </label>
      <label>Cantidad de veces pedido:
        <input type="number" v-model.number="filtroCantidad" min="0"
          @input="filtroCantidad = $event.target.value >= 0 ? $event.target.value : ''">
      </label>
      <label>Categoría:
        <select v-model="filtroCategoria">
          <option value="">Todas</option>
          <option v-for="cat in categorias" :key="cat.id_categoria" :value="cat.nombre">
            {{ cat.nombre }}
          </option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportarPDF">Exportar PDF</button>
      <button type="button" @click="exportarExcel">Exportar Excel</button>
      <span class="ayuda" title="Filtre por fecha, cantidad, categoría. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla" id="tabla-productos">
      <thead>
        <tr>
          <th>ID Producto</th>
          <th>Nombre</th>
          <th v-if="mostrarVecesPedido">Veces Pedido</th>
          <th>Precio</th>
          <th>Costo</th>
          <th>Ganancia</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productosFiltrados" :key="producto.id_producto">
          <td>{{ producto.id_producto }}</td>
          <td>{{ producto.nombre }}</td>
          <td v-if="mostrarVecesPedido">{{ producto.veces_pedido }}</td>
          <td>${{ producto.precio || (producto.ingresos / (producto.cantidad || 1)).toFixed(2) }}</td>
          <td>${{ producto.costo || (producto.precio ? (producto.precio * 0.6).toFixed(2) : ((producto.ingresos /
            (producto.cantidad || 1)) * 0.6).toFixed(2)) }}</td>
          <td>${{ (producto.precio - producto.costo).toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="totales">
      <span><b>Total ingresos en página:</b> ${{ totalGeneral.toFixed(2) }}</span>
      <span><b>Ganancia total en página:</b> ${{ gananciaTotal.toFixed(2) }}</span>
      <span class="leyenda">
        <b>Leyenda:</b>
        <span class="leyenda-categoria leyenda-bebida"></span> Bebida
        <span class="leyenda-categoria leyenda-snack"></span> Snack
        <span class="leyenda-categoria leyenda-otro"></span> Otro
      </span>
    </div>
    <div class="paginacion">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }}</span>
      <button :disabled="productosFiltrados.length < porPagina" @click="pagina++">Siguiente</button>
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
  name: 'ReporteProductos',
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
  name: 'ReporteProductos',
  components: { BarChart },
  data() {
    const hoy = new Date();
    const mesPasado = new Date();
    mesPasado.setMonth(hoy.getMonth() - 1);

    return {
      fechaInicio: this.formatDate(mesPasado),
      fechaFin: this.formatDate(hoy),
      filtroCategoria: '',
      filtroCantidad: '',
      pagina: 1,
      porPagina: 10,
      categoriasDummy: [],
      cantidadesDummy: [40, 70, 90, 120],
      productos: [],
      chartData: null,
      chartOptions: {
        responsive: true,
        plugins: { legend: { display: false } }
      }
    };
  },
  async created() {
    await this.fetchCategorias();
  },
  computed: {
    productosFiltrados() {
      const start = (this.pagina - 1) * this.porPagina;
      return this.productos.slice(start, start + this.porPagina);
    },
    totalGeneral() {
      return this.productosFiltrados.reduce((acc, p) => {
        const cantidad = this.filtroCantidad ? 1 : p.veces_pedido || 0;
        return acc + (p.precio * cantidad);
      }, 0);
    },
    gananciaTotal() {
      return this.productosFiltrados.reduce((acc, p) => {
        const cantidad = this.filtroCantidad ? 1 : p.veces_pedido || 0;
        return acc + ((p.precio - p.costo) * cantidad);
      }, 0);
    },
    mostrarVecesPedido() {
      return !this.filtroCantidad;
    }
  },
  methods: {
    formatDate(date) {
      if (!date) return '';
      return date.toISOString().split('T')[0];
    },

    async fetchCategorias() {
      try {
        const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3030';
        const res = await fetch(`${API_URL}/api/categorias`);
        this.categorias = await res.json();
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      }
    },
    async fetchProductos() {
      try {
        const API_URL = process.env.VUE_APP_API_URL || 'http://localhost:3030';

        const params = new URLSearchParams({
          fecha_inicio: this.fechaInicio,
          fecha_fin: this.fechaFin,
          cantidad_veces_pedido: this.filtroCantidad || '',
          categoria: this.filtroCategoria || ''
        });

        const res = await fetch(`${API_URL}/api/reportes/productos?${params.toString()}`);

        if (!res.ok) {
          const error = await res.json();
          throw new Error(error.error || 'Error al cargar productos');
        }

        this.productos = (await res.json()).map(p => ({
          ...p,
          precio: Number(p.precio) || 0,
          costo: Number(p.costo) || 0,
          veces_pedido: Number(p.veces_pedido) || 0,
          ingresos: Number(p.ingresos) || 0
        }));

        this.updateChart();
      } catch (error) {
        console.error('Error:', error);
        alert(error.message);
        this.productos = [];
      }
    },
    async buscar() {
      this.pagina = 1;
      await this.fetchProductos();
    },
    exportarPDF() {
      import('html2pdf.js').then(html2pdf => {
        const element = document.getElementById('tabla-productos');
        html2pdf.default().from(element).save('reporte_productos.pdf');
      });
    },
    exportarExcel() {
      import('xlsx').then(XLSX => {
        const ws = XLSX.utils.table_to_sheet(document.getElementById('tabla-productos'));
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Productos');
        XLSX.writeFile(wb, 'reporte_productos.xlsx');
      });
    },
    refrescar() {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.filtroCategoria = '';
      this.filtroCantidad = '';
      this.pagina = 1;
    },
    updateChart() {
      const dataFiltrada = this.productosFiltrados;
      const labels = [...new Set(dataFiltrada.map(p => p.nombre))];
      const data = labels.map(producto =>
        dataFiltrada
          .filter(p => p.nombre === producto)
          .reduce((acc, p) => acc + (Number(p.veces_pedido) || 0), 0)
      );

      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Cantidad de Veces Pedido por Producto',
            backgroundColor: ['#42b983', '#f7b731', '#eb3b5a'],
            data
          }
        ]
      };
    }
  },
  async mounted() {
    await this.fetchProductos();
    this.updateChart();
  },
  watch: {
    productosFiltrados: {
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
  table-layout: fixed;
}

.tabla th,
.tabla td {
  border: 1px solid #ccc;
  padding: 0.7rem;
  text-align: center;
  transition: all 0.3s ease;
}

.tabla th {
  background: #f0f0f0;
}

.leyenda {
  margin-left: 2rem;
  font-size: 0.95rem;
}

.leyenda-categoria {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}

.leyenda-bebida {
  background: #42b983;
}

.leyenda-snack {
  background: #f7b731;
}

.leyenda-otro {
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
</style>
