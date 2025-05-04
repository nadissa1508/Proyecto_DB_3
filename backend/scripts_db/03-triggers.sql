-- Trigger 1: Verificar stock antes de realizar una venta

CREATE OR REPLACE FUNCTION verificar_stock()
RETURNS TRIGGER AS $$
DECLARE
  rec RECORD;
  stock_actual INT;
BEGIN
  -- Por cada ingrediente necesario para el producto
  FOR rec IN SELECT ip.id_ingrediente, i.cantidad AS stock
            FROM ingrediente_producto ip
            JOIN ingredientes i ON ip.id_ingrediente = i.id_ingrediente
            WHERE ip.id_producto = NEW.id_producto
  LOOP
    stock_actual := rec.stock;
    IF stock_actual < NEW.cantidad THEN
      RAISE EXCEPTION 'Stock insuficiente para el ingrediente % (stock actual: %, requerido: %)', rec.id_ingrediente, stock_actual, NEW.cantidad;
    END IF;
  END LOOP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_verificar_stock
BEFORE INSERT OR UPDATE ON detalles_pedido
FOR EACH ROW
EXECUTE FUNCTION verificar_stock();

-- Trigger 2: Registrar fecha de modificación de un pedido
CREATE OR REPLACE FUNCTION registrar_modificacion_pedido()
RETURNS TRIGGER AS $$
BEGIN
  NEW.fecha_hora := CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_registrar_modificacion_pedido
BEFORE UPDATE ON pedidos
FOR EACH ROW
EXECUTE FUNCTION registrar_modificacion_pedido();

-- Trigger 3: Actualizar stock de ingredientes después de una venta
CREATE OR REPLACE FUNCTION actualizar_stock()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE ingredientes
  SET cantidad = cantidad - NEW.cantidad
  WHERE id_ingrediente = NEW.id_ingrediente;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_actualizar_stock
AFTER INSERT ON detalles_pedido
FOR EACH ROW
EXECUTE FUNCTION actualizar_stock();

-- Test para trigger 1
INSERT INTO ingredientes (nombre_producto, cantidad, lote) VALUES ('Ingrediente Test', 10, 'LoteTest');
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
VALUES (1, 1, 15, 5.00, 75.00);
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
VALUES (1, 1, 5, 5.00, 25.00);

-- Test para trigger 2
INSERT INTO pedidos (id_cliente, id_empleado, estado, tipo_pedido, total, hora_entrega_esperada)
VALUES (1, 1, 'pendiente', 'local', 100.00, NOW() + interval '1 hour');
UPDATE pedidos SET estado = 'en preparacion' WHERE id_pedido = 1;
SELECT fecha_hora FROM pedidos WHERE id_pedido = 1;

-- Test para trigger 3
INSERT INTO ingredientes (nombre_producto, cantidad, lote) VALUES ('Ingrediente Test 2', 20, 'LoteTest2');
INSERT INTO detalles_pedido (id_pedido, id_producto, cantidad, precio_unitario, subtotal)
VALUES (2, 2, 5, 10.00, 50.00);
SELECT cantidad FROM ingredientes WHERE nombre_producto = 'Ingrediente Test 2';
