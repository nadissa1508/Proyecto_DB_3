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
<!--     <div class="kpi-row">
      <div class="kpi-card">
        <div class="kpi-title">Ventas del mes</div>
        <div class="kpi-value">${{ ventasMes }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Pedidos hoy</div>
        <div class="kpi-value">{{ pedidosHoy }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Clientes frecuentes</div>
        <div class="kpi-value">{{ clientesFrecuentes }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Producto top</div>
        <div class="kpi-value">{{ productoTop }}</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-title">Inventario bajo mínimo</div>
        <div class="kpi-value">{{ inventarioBajo }}</div>
      </div>
    </div> -->
    <!-- <div class="dashboard-graph">
      <h3>Ventas por método de pago</h3>
      <div class="bar-graph">
        <div v-for="m in metodosPago" :key="m.nombre" class="bar-item">
          <span class="bar-label">{{ m.nombre }}</span>
          <div class="bar-bar" :style="{width: m.valor * 2 + 'px'}">${{ m.valor }}</div>
        </div>
      </div>
    </div> -->
<!--     <button class="exportar-btn" @click="exportar">Exportar resumen</button> -->
    <router-view />
  </div>
</template>

<!-- <script>
export default {
  name: 'Dashboard',
  data() {
    return {
      ventasMes: 4250,
      pedidosHoy: 32,
      clientesFrecuentes: 12,
      productoTop: 'Café Americano',
      inventarioBajo: 2,
      metodosPago: [
        { nombre: 'Efectivo', valor: 1800 },
        { nombre: 'Tarjeta', valor: 1500 },
        { nombre: 'QR', valor: 600 },
        { nombre: 'Transferencia', valor: 350 },
      ],
    };
  },
  methods: {
/*     exportar() {
      alert('Función de exportar resumen no implementada (demo)');
    }, */
  },
};
</script> -->

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
.dashboard-nav {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
  justify-content: center;
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
/* .kpi-row {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 2.5rem;
  flex-wrap: wrap;
  justify-content: center;
}
.kpi-card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 8px #0001;
  padding: 1.2rem 2.2rem;
  min-width: 170px;
  text-align: center;
  margin-bottom: 1rem;
}
.kpi-title {
  font-size: 1.1rem;
  color: #888;
  margin-bottom: 0.3rem;
}
.kpi-value {
  font-size: 1.7rem;
  font-weight: bold;
  color: #42b983;
}
.dashboard-graph {
  width: 100%;
  max-width: 600px;
  margin: 0 auto 2rem auto;
  background: #fafbfc;
  border-radius: 10px;
  padding: 1.2rem 1.5rem;
  box-shadow: 0 2px 8px #0001;
}
.bar-graph {
  margin-top: 1rem;
}
.bar-item {
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
}
.bar-label {
  width: 120px;
  font-weight: 500;
}
.bar-bar {
  background: #42b983;
  color: #fff;
  border-radius: 6px;
  padding: 0.3rem 1rem;
  margin-left: 0.5rem;
  min-width: 60px;
  text-align: left;
  font-weight: 500;
}
.exportar-btn {
  margin: 1.5rem 0 2rem 0;
  padding: 0.6rem 2.2rem;
  border-radius: 8px;
  border: 1px solid #42b983;
  background: #fff;
  color: #42b983;
  font-size: 1.1rem;
  font-weight: bold;
  cursor: pointer;
  transition: background 0.2s, color 0.2s;
}
.exportar-btn:hover {
  background: #42b983;
  color: #fff;
} */
</style>
