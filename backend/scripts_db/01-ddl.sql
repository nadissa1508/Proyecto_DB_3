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
  puntos_fidelizacion int NOT NULL DEFAULT 0 CHECK (puntos_fidelizacion >= 0),
  fecha_registro timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
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

-- Tabla de Productos
CREATE TABLE productos (
  id_producto serial PRIMARY KEY,
  id_categoria int NOT NULL REFERENCES categorias(id_categoria),
  nombre varchar(100) NOT NULL,
  descripcion varchar(255) NOT NULL,
  precio decimal(10,2) NOT NULL CHECK (precio >= 0),
  costo decimal(10,2) NOT NULL CHECK (costo >= 0),
  disponibilidad boolean NOT NULL DEFAULT true
);

-- Tabla Localizaciones
CREATE TABLE localizaciones (
  id serial PRIMARY KEY,
  tipo tipo_localizacion_enum NOT NULL,
  numero varchar(5) 
);

-- Tabla de Pedidos
CREATE TABLE pedidos (
  id_pedido serial PRIMARY KEY,
  id_cliente int NOT NULL REFERENCES clientes(id_cliente),
  id_empleado int NOT NULL REFERENCES empleados(id_empleado),
  id_localizacion int REFERENCES localizaciones(id),
  fecha_hora timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  estado estado_pedido_enum NOT NULL,
  tipo_pedido tipo_pedido_enum NOT NULL,
  total decimal(10,2) NOT NULL CHECK (total >= 0),
  cupon decimal(10,2) NOT NULL DEFAULT 0 CHECK (cupon >= 0),
  notas varchar(500),
  hora_entrega_esperada timestamp NOT NULL
);

-- Tabla Detalles de Pedido
CREATE TABLE detalles_pedido (
  id_detalle serial PRIMARY KEY,
  id_pedido int NOT NULL REFERENCES pedidos(id_pedido),
  id_producto int NOT NULL REFERENCES productos(id_producto),
  cantidad int NOT NULL DEFAULT 1 CHECK (cantidad > 0),
  precio_unitario decimal(10,2) NOT NULL CHECK (precio_unitario >= 0),
  subtotal decimal(10,2) NOT NULL CHECK (subtotal >= 0),
  comentarios varchar(155)
);

-- Tabla Ingredientes
CREATE TABLE ingredientes (
  id_ingrediente serial PRIMARY KEY,
  nombre_producto varchar(50) NOT NULL,
  cantidad int NOT NULL CHECK (cantidad >= 0),
  lote varchar(100)
);

-- Tabla de Relación Producto-Ingrediente
CREATE TABLE ingrediente_producto (
  id_ingrediente int NOT NULL REFERENCES ingredientes(id_ingrediente) ON DELETE CASCADE,
  id_producto int NOT NULL REFERENCES productos(id_producto) ON DELETE CASCADE,
  PRIMARY KEY (id_ingrediente, id_producto)
);

-- Métodos de Pago
CREATE TABLE metodos_pago (
  id serial PRIMARY KEY,
  metodo_pago varchar(50) UNIQUE NOT NULL
);

-- Pagos
CREATE TABLE pagos (
  id_pago serial PRIMARY KEY,
  id_pedido int NOT NULL REFERENCES pedidos(id_pedido),
  id_metodo_pago int NOT NULL REFERENCES metodos_pago(id),
  fecha timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);