import { createRouter, createWebHistory } from 'vue-router';
import Dashboard from './components/Dashboard.vue';
import ReporteVentas from './components/ReporteVentas.vue';
import ReporteClientes from './components/ReporteClientes.vue';
import ReporteInventario from './components/ReporteInventario.vue';
import ReportePedidos from './components/ReportePedidos.vue';
import ReporteProductos from './components/ReporteProductos.vue';

const routes = [
  { path: '/', component: Dashboard },
  { path: '/reporte-ventas', component: ReporteVentas },
  { path: '/reporte-clientes', component: ReporteClientes },
  { path: '/reporte-inventario', component: ReporteInventario },
  { path: '/reporte-pedidos', component: ReportePedidos },
  { path: '/reporte-productos', component: ReporteProductos },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
