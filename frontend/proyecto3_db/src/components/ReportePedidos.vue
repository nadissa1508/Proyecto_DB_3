<template>
  <div class="reporte">
    <h2>Pedidos</h2>
    <form class="filtros">
      <label>Desde: <input type="date" v-model="fechaInicio" /></label>
      <label>Hasta: <input type="date" v-model="fechaFin" /></label>
      <button type="button" @click="buscar">Buscar</button>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>ID Pedido</th>
          <th>Cliente</th>
          <th>Fecha</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="pedido in pedidos" :key="pedido.id">
          <td>{{ pedido.id }}</td>
          <td>{{ pedido.cliente }}</td>
          <td>{{ pedido.fecha }}</td>
          <td>{{ pedido.total }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ReportePedidos',
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      pedidos: [],
    };
  },
  methods: {
    buscar() {
      // Lógica para buscar pedidos
      this.pedidos = [
        { id: 101, cliente: 'Ana Pérez', fecha: '2025-05-01', total: 50 },
        { id: 102, cliente: 'Luis Gómez', fecha: '2025-05-02', total: 80 },
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
