<template>
  <div class="reporte">
    <h2>Clientes Frecuentes</h2>
    <form class="filtros">
      <label>Desde:
        <input type="date" v-model="fechaInicio" />
      </label>
      <label>Hasta:
        <input type="date" v-model="fechaFin" />
      </label>
      <label>Cliente:
        <select v-model="filtroCliente">
          <option value="">Todos</option>
          <option v-for="c in clientesDummy" :key="c" :value="c">{{ c }}</option>
        </select>
      </label>
      <label>Puntos de Fidelización:
        <select v-model="filtroPuntos">
          <option value="">Todos</option>
          <option v-for="p in puntosDummy" :key="p" :value="p">{{ p }}</option>
        </select>
      </label>
      <button type="button" @click="buscar">Buscar</button>
      <button type="button" @click="refrescar">Refrescar</button>
      <button type="button" @click="exportar">Exportar</button>
      <span class="ayuda" title="Filtre por fecha, cliente, frecuencia y estado. Exporte o refresque los datos.">?</span>
    </form>
    <table class="tabla">
      <thead>
        <tr>
          <th>Cliente</th>
          <th>Pedidos</th>
          <th>Total Gastado</th>
          <th>Última Compra</th>
          <th>Puntos</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="cliente in clientesFiltrados" :key="cliente.id">
          <td>{{ cliente.nombre }}</td>
          <td>{{ cliente.pedidos }}</td>
          <td>${{ cliente.total.toFixed(2) }}</td>
          <td>{{ cliente.ultima }}</td>
          <td>{{ cliente.puntos }}</td>
        </tr>
      </tbody>
    </table>
    <div class="totales">
      <span><b>Total gastado:</b> ${{ totalGeneral.toFixed(2) }}</span>
      <span class="leyenda">
        <b>Leyenda:</b>
        <span class="leyenda-frecuencia leyenda-alta"></span> Alta
        <span class="leyenda-frecuencia leyenda-media"></span> Media
        <span class="leyenda-frecuencia leyenda-baja"></span> Baja
        <span class="leyenda-estado leyenda-activo"></span> Activo
        <span class="leyenda-estado leyenda-inactivo"></span> Inactivo
      </span>
    </div>
    <div class="paginacion">
      <button :disabled="pagina === 1" @click="pagina--">Anterior</button>
      <span>Página {{ pagina }}</span>
      <button :disabled="clientesFiltrados.length < porPagina" @click="pagina++">Siguiente</button>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReporteClientes',
  data() {
    return {
      fechaInicio: '',
      fechaFin: '',
      filtroCliente: '',
      pagina: 1,
      porPagina: 10,
      clientesDummy: ['Ana Pérez', 'Luis Gómez', 'Pedro Torres', 'María López'],
      puntosDummy: [0, 10, 20, 30, 40, 50],
      clientes: [
        { id: 1, nombre: 'Ana Pérez', pedidos: 12, total: 500, ultima: '2025-04-30', puntos: 50 },
        { id: 2, nombre: 'Luis Gómez', pedidos: 9, total: 350, ultima: '2025-04-29', puntos: 30 },
        { id: 3, nombre: 'Pedro Torres', pedidos: 7, total: 210, ultima: '2025-04-28', puntos: 10 },
        { id: 4, nombre: 'María López', pedidos: 5, total: 150, ultima: '2025-04-27', puntos: 20 },
        // ...más datos de ejemplo
      ],
      filtroPuntos: '',
    };
  },
  computed: {
    clientesFiltrados() {
      let filtrados = this.clientes.filter(c => {
        const fechaOk = (!this.fechaInicio || c.ultima >= this.fechaInicio) && (!this.fechaFin || c.ultima <= this.fechaFin);
        const clienteOk = !this.filtroCliente || c.nombre === this.filtroCliente;
        const puntosOk = !this.filtroPuntos || c.puntos == this.filtroPuntos;
        return fechaOk && clienteOk && puntosOk;
      });
      const start = (this.pagina - 1) * this.porPagina;
      return filtrados.slice(start, start + this.porPagina);
    },
    totalGeneral() {
      return this.clientesFiltrados.reduce((acc, c) => acc + c.total, 0);
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
      this.filtroCliente = '';
      this.filtroPuntos = '';
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
  align-items: center;
  justify-content: center;
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
.leyenda-frecuencia {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}
.leyenda-alta { background: #42b983; }
.leyenda-media { background: #f7b731; }
.leyenda-baja { background: #eb3b5a; }
.leyenda-estado {
  display: inline-block;
  width: 1.1em;
  height: 1.1em;
  border-radius: 50%;
  margin-right: 0.3em;
  vertical-align: middle;
}
.leyenda-activo { background: #42b983; }
.leyenda-inactivo { background: #eb3b5a; }
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
.estado-activo td { background: #eaffea; }
.estado-inactivo td { background: #ffeaea; }
</style>
