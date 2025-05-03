<template>
  <div class="reporte">
    <h2>Productos Más Vendidos</h2>
    <form class="filtros">
      <label>Desde: <input type="date" v-model="fechaInicio" /></label>
      <label>Hasta: <input type="date" v-model="fechaFin" /></label>
      <label>Categoría:
        <select v-model="filtroCategoria">
          <option value="">Todas</option>
          <option v-for="cat in categoriasDummy" :key="cat" :value="cat">{{ cat }}</option>
        </select>
      </label>
      <label>Cantidad de veces pedido:
        <select v-model="filtroCantidad">
          <option value="">Todas</option>
          <option v-for="c in cantidadesDummy" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportar">Exportar</button>
      <span class="ayuda" title="Filtre por fecha, producto, categoría y proveedor. Exporte, refresque o consulte la leyenda de categorías.">?</span>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Categoría</th>
          <th>Cantidad Vendida</th>
          <th>Ingresos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productosFiltrados" :key="producto.id">
          <td>{{ producto.nombre }}</td>
          <td>
            <span :title="producto.categoria">
              <span :class="'leyenda-categoria leyenda-' + producto.categoria.toLowerCase().replace(/ /g, '-')"></span>
              {{ producto.categoria }}
            </span>
          </td>
          <td>{{ producto.cantidad }}</td>
          <td>${{ producto.ingresos.toFixed(2) }}</td>
        </tr>
      </tbody>
    </table>
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
export default {
  name: 'ReporteProductos',
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
        { id: 1, nombre: 'Café Americano', categoria: 'Bebida', cantidad: 120, ingresos: 1800 },
        { id: 2, nombre: 'Capuchino', categoria: 'Bebida', cantidad: 90, ingresos: 1350 },
        { id: 3, nombre: 'Latte', categoria: 'Bebida', cantidad: 70, ingresos: 1050 },
        { id: 4, nombre: 'Té Verde', categoria: 'Otro', cantidad: 40, ingresos: 400 },
        // ...más datos de ejemplo
      ],
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
    exportar() {
      alert('Función de exportar no implementada (demo)');
    },
    refrescar() {
      this.fechaInicio = '';
      this.fechaFin = '';
      this.filtroCategoria = '';
      this.filtroCantidad = '';
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
