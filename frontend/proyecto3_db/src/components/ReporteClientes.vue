<template>
  <div class="reporte">
    <h2>Clientes Frecuentes</h2>
    <form class="filtros">
      <label>Desde: <input type="date" v-model="fechaInicio" /></label>
      <label>Hasta: <input type="date" v-model="fechaFin" /></label>
      <button type="button" @click="buscar">Buscar</button>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Pedidos</th>
          <th>Total Gastado</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientes" :key="cliente.id">
          <td>{{ cliente.nombre }}</td>
          <td>{{ cliente.pedidos }}</td>
          <td>{{ cliente.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ReporteClientes',
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      clientes: [],
    };
  },
  methods: {
    buscar() {
      // Lógica para buscar clientes frecuentes
      this.clientes = [
        { id: 1, nombre: 'Ana Pérez', pedidos: 12, total: 500 },
        { id: 2, nombre: 'Luis Gómez', pedidos: 9, total: 350 },
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
