-- ENUMs
CREATE TYPE rol_enum AS ENUM ('administrador', 'cajero', 'barista');
CREATE TYPE estado_pedido_enum AS ENUM ('pendiente', 'en preparacion', 'completado', 'cancelado');
CREATE TYPE tipo_pedido_enum AS ENUM ('local', 'para llevar', 'delivery');
CREATE TYPE tipo_localizacion_enum AS ENUM ('barra', 'mesa', 'parado');

-- Tabla de Empleados
CREATE TABLE empleados (
  id_empleado serial PRIMARY KEY,
  nombre varchar(100) NOT NULL,
  apellido varchar(100) NOT NULL,
  email varchar(100) UNIQUE NOT NULL,
  rol rol_enum NOT NULL,
  fecha_creacion timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  activo boolean NOT NULL DEFAULT true
);

-- Tabla de Clientes
CREATE TABLE clientes (
  id_cliente serial PRIMARY KEY,
  nombre varchar(100) NOT NULL,
  apellido varchar(100) NOT NULL,
  email varchar(100) UNIQUE NOT NULL,
  puntos_fidelizacion int NOT NULL DEFAULT 0 CHECK (puntos_fidelizacion >= 0)
);

-- Teléfonos de Clientes 
CREATE TABLE cliente_telefonos (
  id serial PRIMARY KEY,
  id_cliente int NOT NULL REFERENCES clientes(id_cliente) ON DELETE CASCADE,
  telefono varchar(20) NOT NULL
);

-- Tabla de Categorías
CREATE TABLE categorias (
  id_categoria serial PRIMARY KEY,
  nombre varchar(50) NOT NULL,
  descripcion varchar(200) NOT NULL
);
