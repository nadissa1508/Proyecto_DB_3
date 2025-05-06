<template>
    <div id="app">
      <router-view />
    </div>
  </template>
  
  <script>
  export default {
    name: 'App',
  };
  </script>
  
  <style>
  #app {
    font-family: Avenir, Helvetica, Arial, sans-serif;
    text-align: center;
    padding: 2rem;
    display: block;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100vh; 
    margin: 0; 
    max-width: 1200px; /* Increased width */
    width: 100%;
  }
  </style>
