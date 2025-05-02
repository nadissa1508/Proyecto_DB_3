<template>
  <div class="reporte">
    <h2>Inventario</h2>
    <table class="tabla">
      <thead>
        <tr>
          <th>Producto</th>
          <th>Cantidad</th>
          <th>Unidad</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in inventario" :key="item.id">
          <td>{{ item.producto }}</td>
          <td>{{ item.cantidad }}</td>
          <td>{{ item.unidad }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
export default {
  name: 'ReporteInventario',
  data() {
    return {
      inventario: [
        { id: 1, producto: 'Café', cantidad: 20, unidad: 'kg' },
        { id: 2, producto: 'Leche', cantidad: 15, unidad: 'L' },
      ],
    };
  },
};
</script>

<style scoped>
.reporte { max-width: 700px; margin: 0 auto; }
.tabla { width: 100%; border-collapse: collapse; }
.tabla th, .tabla td { border: 1px solid #ccc; padding: 0.5rem; text-align: center; }
</style>
