<template>
  <div class="reporte">
    <h2>Productos Más Vendidos</h2>
    <form class="filtros">
      <label>Desde: <input type="date" v-model="fechaInicio" /></label>
      <label>Hasta: <input type="date" v-model="fechaFin" /></label>
      <button type="button" @click="buscar">Buscar</button>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad Vendida</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="producto in productos" :key="producto.id">
          <td>{{ producto.nombre }}</td>
          <td>{{ producto.cantidad }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ReporteProductos',
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      productos: [],
    };
  },
  methods: {
    buscar() {
      // Lógica para buscar productos más vendidos
      this.productos = [
        { id: 1, nombre: 'Café Americano', cantidad: 120 },
        { id: 2, nombre: 'Capuchino', cantidad: 90 },
      ];
    },
  },
};
</script>

<style scoped>
.reporte { max-width: 700px; margin: 0 auto; }
.filtros { display: flex; gap: 1rem; margin-bottom: 1rem; }
.tabla { width: 100%; border-collapse: collapse; }
.tabla th, .tabla td { border: 1px solid #ccc; padding: 0.5rem; text-align: center; }
</style>
