<template>
  <div class="reporte">
    <h2>Reporte de Ventas</h2>
    <form class="filtros">
      <label>Desde: <input type="date" v-model="fechaInicio" /></label>
      <label>Hasta: <input type="date" v-model="fechaFin" /></label>
      <button type="button" @click="buscar">Buscar</button>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>Fecha</th>
          <th>Total Ventas</th>
          <th>Método de Pago</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="venta in ventas" :key="venta.id">
          <td>{{ venta.fecha }}</td>
          <td>{{ venta.total }}</td>
          <td>{{ venta.metodo_pago }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ReporteVentas',
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      ventas: [], // Aquí se llenará con datos reales
    };
  },
  methods: {
    buscar() {
      // Aquí irá la lógica para buscar ventas por fecha
      // Por ahora, datos de ejemplo
      this.ventas = [
        { id: 1, fecha: '2025-05-01', total: 150, metodo_pago: 'Efectivo' },
        { id: 2, fecha: '2025-05-02', total: 200, metodo_pago: 'Tarjeta' },
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
