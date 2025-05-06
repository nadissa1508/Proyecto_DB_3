<template>
  <div class="dashboard">
    <h1>Panel de Reportes Cafetería</h1>
    <div class="dashboard-buttons">
      <router-link to="/reporte-ventas" class="dashboard-button ventas">Reporte de Ventas</router-link>
      <router-link to="/reporte-clientes" class="dashboard-button clientes">Clientes Frecuentes</router-link>
      <router-link to="/reporte-inventario" class="dashboard-button inventario">Inventario</router-link>
      <router-link to="/reporte-pedidos" class="dashboard-button pedidos">Pedidos</router-link>
      <router-link to="/reporte-productos" class="dashboard-button productos">Productos Más Vendidos</router-link>
    </div>
    <router-view />
  </div>
</template>

<style scoped>
.dashboard {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 1rem 1rem;
}

.dashboard-buttons {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  width: 100%;
  max-width: 400px;
}

.dashboard-button {
  text-decoration: none;
  text-align: center;
  font-weight: bold;
  padding: 1rem;
  border-radius: 8px;
  color: white;
  transition: transform 0.2s, box-shadow 0.2s;
}

.dashboard-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.ventas {
  background-color: #d9a066; /* Matches the orange tone from the palette */
}

.clientes {
  background-color: #8c644a; /* Matches the brown tone from the palette */
}

.inventario {
  background-color: #a7a7a7; /* Matches the gray tone from the palette */
}

.pedidos {
  background-color: #66a09e; /* Matches the teal tone from the palette */
}

.productos {
  background-color: #d9c7a1; /* Matches the beige tone from the palette */
}
</style>
