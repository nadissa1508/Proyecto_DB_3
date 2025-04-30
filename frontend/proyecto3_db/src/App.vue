<template>
    <div id="app">
      <h1>Vue + Docker funcionando ✅</h1>
      <p>Mensaje del backend:</p>
      <pre>{{ message }}</pre>
    </div>
  </template>
  
  <script>
  export default {
    data() {
      return {
        message: 'Cargando...'
      };
    },
    mounted() {
      fetch('http://localhost:5000/')
        .then(res => res.text())
        .then(data => {
          this.message = data;
        })
        .catch(err => {
          this.message = 'Error al conectar con el backend 😢';
          console.error(err);
        });
    }
  };
  </script>
  
  <style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh; 
    margin: 0; 
  }
  </style>
  