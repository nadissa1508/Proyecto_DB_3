<template>
  <div class="dashboard">
    <h1>Panel de Reportes Cafetería</h1>
    <nav class="dashboard-nav">
      <router-link to="/reporte-ventas">Reporte de Ventas</router-link>
      <router-link to="/reporte-clientes">Clientes Frecuentes</router-link>
      <router-link to="/reporte-inventario">Inventario</router-link>
      <router-link to="/reporte-pedidos">Pedidos</router-link>
      <router-link to="/reporte-productos">Productos Más Vendidos</router-link>
    </nav>
    <router-view />
  </div>
</template>

<script>
export default {
  name: 'Dashboard',
};
</script>

<style scoped>
.dashboard {
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
}
.dashboard-nav {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
}
.dashboard-nav a {
  text-decoration: none;
  color: #2c3e50;
  font-weight: bold;
  border-bottom: 2px solid transparent;
  transition: border 0.2s;
}
.dashboard-nav a.router-link-exact-active {
  border-bottom: 2px solid #42b983;
}
</style>
