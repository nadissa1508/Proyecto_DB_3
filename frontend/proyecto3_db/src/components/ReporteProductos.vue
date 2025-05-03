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
        <select v-model="filtroCantidad">
          <option value="">Todas</option>
          <option v-for="c in cantidadesDummy" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label>Categoría:
        <select v-model="filtroCategoria">
          <option value="">Todas</option>
          <option v-for="cat in categoriasDummy" :key="cat" :value="cat">{{ cat }}</option>
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
          <th>Precio</th>
          <th>Costo</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productosFiltrados" :key="producto.id">
          <td>{{ producto.id }}</td>
          <td>{{ producto.nombre }}</td>
          <td>${{ producto.precio || (producto.ingresos / (producto.cantidad || 1)).toFixed(2) }}</td>
          <td>${{ producto.costo || (producto.precio ? (producto.precio * 0.6).toFixed(2) : ((producto.ingresos / (producto.cantidad || 1)) * 0.6).toFixed(2)) }}</td>
        </tr>
      </tbody>
    </table>
    <div class="grafica-container">
      <BarChart :chart-data="chartData" :options="chartOptions" />
    </div>
    <div class="totales">
      <span><b>Total ingresos en página:</b> ${{ totalGeneral.toFixed(2) }}</span>
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
  name: 'ReporteProductos',
  components: { BarChart },
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      filtroCategoria: '',
      filtroCantidad: '',
      pagina: 1,
      porPagina: 10,
      categoriasDummy: ['Bebida', 'Snack', 'Otro'],
      cantidadesDummy: [40, 70, 90, 120],
      productos: [
        { id: 1, nombre: 'Café Americano', categoria: 'Bebida', cantidad: 120, ingresos: 1800, precio: 15, costo: 9 },
        { id: 2, nombre: 'Capuchino', categoria: 'Bebida', cantidad: 90, ingresos: 1350, precio: 15, costo: 9 },
        { id: 3, nombre: 'Latte', categoria: 'Bebida', cantidad: 70, ingresos: 1050, precio: 15, costo: 9 },
        { id: 4, nombre: 'Té Verde', categoria: 'Otro', cantidad: 40, ingresos: 400, precio: 10, costo: 6 },
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
    productosFiltrados() {
      let filtrados = this.productos.filter(p => {
        const fechaOk = true; // No hay fecha en el mock, pero aquí iría la lógica real
        const catOk = !this.filtroCategoria || p.categoria === this.filtroCategoria;
        const cantOk = !this.filtroCantidad || p.cantidad == this.filtroCantidad;
        return fechaOk && catOk && cantOk;
      });
      const start = (this.pagina - 1) * this.porPagina;
      return filtrados.slice(start, start + this.porPagina);
    },
    totalGeneral() {
      return this.productosFiltrados.reduce((acc, p) => acc + p.ingresos, 0);
    }
  },
  methods: {
    buscar() {
      this.pagina = 1;
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
      // Gráfica de ingresos por producto
      const labels = this.productosFiltrados.map(p => p.nombre);
      const data = this.productosFiltrados.map(p => p.ingresos);
      this.chartData = {
        labels,
        datasets: [
          {
            label: 'Ingresos por producto',
            backgroundColor: '#42b983',
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
.leyenda-categoria {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}
.leyenda-bebida { background: #42b983; }
.leyenda-snack { background: #f7b731; }
.leyenda-otro { background: #eb3b5a; }
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
