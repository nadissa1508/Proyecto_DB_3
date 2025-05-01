-- Trigger 1: Verificar stock antes de realizar una venta
CREATE OR REPLACE FUNCTION verificar_stock()
RETURNS TRIGGER AS $$
BEGIN
  IF (SELECT cantidad FROM ingredientes WHERE id_ingrediente = NEW.id_ingrediente) < NEW.cantidad THEN
    RAISE EXCEPTION 'Stock insuficiente para el ingrediente %', NEW.id_ingrediente;
  END IF;
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
  NEW.fecha_hora = CURRENT_TIMESTAMP;
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