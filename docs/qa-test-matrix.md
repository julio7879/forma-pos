# Matriz de Pruebas y Checklist de Aceptación — FORMA MVP

## 1. Información general

- **Proyecto:** FORMA
- **Documento:** Matriz de pruebas y checklist de aceptación
- **Versión:** 1.0
- **Responsable:** Thomas — QA / Tester
- **Objetivo:** Verificar las funcionalidades esenciales del MVP antes de cada demo o release.

---

## 2. Alcance de las pruebas

### 2.1 Tienda web

- [ ] 
- [ ] 
- [ ] 

### 2.2 POS

- [ ] 
- [ ] 
- [ ] 

### 2.3 Administración

- [ ] 
- [ ] 
- [ ] 

---


## 3. Matriz de casos de prueba

| ID | CASO DE PRUEBA | DATOS DE ENTRADA | PASOS | RESULTADO ESPERADO | ESTADO |
|---|---|---|---|---|---|
| QA-01 | Verificar disponibilidad del backend y configuración CORS |Método: GET URL: /api/health Headers: Origin: http://localhost:5173 | 1 Iniciar servidor backend en puerto 3000. 2. Enviar petición GET a /api/health con encabezado Origin. 3. Verificar código de estado HTTP. 4. Verificar encabezado Access-Control-Allow-Origin. 5. Validar estructura del cuerpo JSON. |HTTP 200 OK, encabezado Access-Control-Allow-Origin retornado correctamente, y cuerpo JSON { "success": true, "data": { "status": "ok", ... } } confirmando disponibilidad del servicio.| PASÓ |
| QA-02 | Consultar catálogo de productos activos y opciones de personalización | Método: GET. Endpoint: `/api/products`. |1. Enviar petición GET al endpoint de productos. 2. Verificar código HTTP 200. 3. Confirmar que todos los productos tienen activo: true. 4. Verificar inclusión de opciones de personalización con sus recargos.|HTTP 200 OK con arreglo de productos activos, incluyendo sus opciones configurables (options) y lista de recargos. | PASÓ |
| QA-03 |Filtrar productos por categoría (insensible a mayúsculas) | Método: GET URL: /api/products?categoria=textil y /api/products?categoria=TEXTIL| 1. Enviar petición GET con parámetro categoria=textil en minúsculas. 2. Enviar petición GET con parámetro categoria=TEXTIL en mayúsculas. 3. Comparar respuestas y validar consistencia. |HTTP 200 OK devolviendo únicamente productos de la categoría solicitada, demostrando que el filtro no depende del uso de mayúsculas o minúsculas.| PASÓ |
| QA-04 | Validar cálculo del total y snapshots de pedidos | Método: POST URL: /api/orders Body: 2 Tazas Cerámica con grabado láser ($5.000 extra) |1. Enviar petición POST para crear un pedido con producto y opciones con recargo. 2. Validar código HTTP 201 Created. 3. Comprobar que total_final cumple con ((base + extras) * cantidad) - descuento. 4. Verificar que se guarden snapshots de nombres, precios y opciones.| HTTP 201 Created, total_final: 60000 exacto y persistencia de snapshots inmutables en los items del pedido. | PASÓ |
| QA-05 | Validación de cupón no acumulable y aplicación en pedido|Método: POST URL: /api/orders Body: Pedido con codigo_promocion: "BIENVENIDA10" |1. Enviar petición POST para crear pedido incluyendo cupón válido. 2. Comprobar que el backend descuente el 10% ($6.000). 3. Validar que total_final refleje el descuento ($54.000). 4. Verificar que se cree el snapshot del descuento en discounts. |HTTP 201 Created con descuento legal aplicado, total final de $54.000 y persistencia del snapshot del cupón. | PASÓ |
| QA-06 |Validar máquina de estados de pedidos y transiciones | Método: PATCH URL: /api/orders/:id/status Header: x-user-role: ADMIN Body: estado_pedido |1. Cambiar estado a EN_PREPARACION (200 OK). 2. Cambiar estado a LISTO (200 OK). 3. Intentar retroceder a RECIBIDO. | HTTP 200 en flujo legal RECIBIDO ➔ EN_PREPARACION ➔ LISTO y rechazo con HTTP 400 ante saltos o retrocesos inválidos. | PASÓ |
| QA-07 |Candado financiero de entrega con saldo pendiente | Método: PATCH URL: /api/orders/:id/status Header: x-user-role: ADMIN Body: {"estado_pedido": "ENTREGADO"} | 1. Seleccionar pedido en estado LISTO con saldo pendiente ($54.000). 2. Intentar cambiar su estado a ENTREGADO. 3. Verificar respuesta del servidor. |Rechazo con código HTTP 400 y error ORDER_PENDING_PAYMENT, bloqueando la entrega si el pedido no está en estado PAGADO.| PASÓ |
| QA-08 | Validar registro de anticipo y pago total | Método: POST URL: /api/payments Body: orderId, monto: 27000, metodo: "TRANSFERENCIA" | 1. Registrar primer pago de anticipo del 50% ($27.000). 2. Comprobar que estado_pago pase a ANTICIPO_PARCIAL y saldo a $27.000. 3. Registrar segundo pago por el saldo restante ($27.000). 4. Comprobar que estado_pago pase a PAGADO con saldo $0. |HTTP 201 Created actualizando progresivamente el estado financiero de PENDIENTE ➔ ANTICIPO_PARCIAL ➔ PAGADO, recalculando el saldo en tiempo real.| PASÓ |
| QA-09 | Consulta pública de tracking sin autenticación | Método: GET URL: /api/orders/track/FORMA-4281?contacto=carlos@example.com | 1. Enviar petición pública GET con referencia y contacto. 2. Verificar código HTTP 200. 3. Confirmar que no requiere autenticación ni expone datos sensibles. | HTTP 200 OK devolviendo estado operativo (LISTO) y financiero (PAGADO) del pedido de forma pública y segura. | PASÓ |

---

## 4. Checklist previo a la demo

### Preparación

- [ ] 
- [ ] 
- [ ] 

### Tienda web

- [ ] 
- [ ] 
- [ ] 

### POS

- [ ] 
- [ ] 
- [ ] 

### Administración

- [ ] 
- [ ] 
- [ ] 

### Calidad general

- [ ] 
- [ ] 
- [ ] 

---

## 5. Criterios de aceptación

**Aprobación**
Todas las pruebas críticas pasan y el flujo principal de la demo funciona de principio a fin.

**Aprobación con observaciones**
Las funciones críticas pasan y solo quedan defectos menores documentados.

**Rechazo**
Falla una función esencial, se pierden datos, los precios son incorrectos o existen vulnerabilidades relevantes de permisos.

---

## 6. Registro de defecto

| ID | CASO RELACIONADO | DESCRIPCIÓN | PASOS PARA REPRODUCIR | RESULTADO ESPERADO | SEVERIDAD | ESTADO |
| --- | --- | --- | --- | --- | --- | --- |
| BUG-01 |  |  |  |  |  |  |
| BUG-02 |  |  |  |  |  |  |
| BUG-03 |  |  |  |  |  |  |
| BUG-04 |  |  |  |  |  |  |
| BUG-05 |  |  |  |  |  |  |
| BUG-06 |  |  |  |  |  |  |
| BUG-07 |  |  |  |  |  |  |
| BUG-08 |  |  |  |  |  |  |
| BUG-09 |  |  |  |  |  |  |

---

## 7. Control de ejecución

| FECHA | VERSIÓN APROBADA | RESPONSABLE | PRUEBAS APROBADAS | PRUEBAS FALLIDAS | DECISIÓN |
| --- | --- | --- | --- | --- | --- |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |
| MM-DD-AA |  |  |  |  |  |