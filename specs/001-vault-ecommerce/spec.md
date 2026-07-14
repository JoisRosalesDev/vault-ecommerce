# Especificación de Requerimientos: Plataforma de Comercio Electrónico VAULT

**Feature Branch**: `001-vault-ecommerce`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "Project Specification: VAULT"

## Clarifications

### Session 2026-07-13
- Q: ¿Cómo se gestionará la concurrencia y protección de la base de datos bajo tráfico elevado (10k usuarios)? → A: Conexión mediante pooler (Supavisor) para mutaciones, catálogo servido desde Vercel Edge Cache (ISR/next: { revalidate }) y rate limiting en rutas críticas (/api/checkout y autenticación).
- Q: ¿Qué medidas de integridad transaccional y pagos se aplicarán con Stripe? → A: Uso obligatorio de idempotency_key en creación de cargos y webhook de Stripe optimizado con mutación idempotente (verificar estado 'PAID' antes de actualizar).
- Q: ¿Cómo se manejará la resiliencia en el cliente y la degradación elegante? → A: Implementar AbortController con timeout de 8-10 segundos en peticiones del cliente y capturar errores mostrando un Toast con mensaje amigable en español.

## User Scenarios & Testing *(mandatory)*

### Caso de Uso 1 - Navegación del Catálogo de Productos y Gestión del Carrito (Prioridad: P1)

El cliente accede a la plataforma, visualiza la lista de productos disponibles en español con su información detallada y puede agregar, quitar o modificar las cantidades de los productos en su carrito de compras local.

**Why this priority**: Es la funcionalidad principal que permite a los usuarios interactuar con el catálogo de productos y preparar su orden de compra, lo cual representa el núcleo de la experiencia del cliente.

**Independent Test**: Se puede validar iniciando una sesión de navegación, agregando productos al carrito, modificando sus cantidades y confirmando que los datos se guarden en el almacenamiento local del navegador (persistencia) y se muestren correctamente actualizados sin recargar la página.

**Acceptance Scenarios**:

1. **Given** un catálogo con 5 productos disponibles, **When** el cliente selecciona "Agregar al carrito" en 1 producto, **Then** el contador del carrito se incrementa a 1 y los detalles del producto se muestran en el resumen del carrito.
2. **Given** un producto ya agregado al carrito con cantidad 1, **When** el cliente incrementa la cantidad a 3, **Then** el subtotal del carrito se recalcula automáticamente reflejando la nueva cantidad.
3. **Given** un carrito con 2 productos, **When** el cliente elimina uno de los productos, **Then** el producto desaparece del carrito y el costo total se actualiza inmediatamente.

---

### Caso de Uso 2 - Pasarela de Pago y Finalización de Compra (Prioridad: P1)

El cliente procede al pago desde el resumen de su carrito, es redirigido a una pasarela segura y, tras completar el pago de manera exitosa, regresa a la plataforma donde visualiza una confirmación de su compra.

**Why this priority**: Permite la monetización y el cierre de la transacción comercial de forma segura.

**Independent Test**: Se puede probar en modo de desarrollo (Stripe test mode) completando un flujo de pago con una tarjeta de prueba y verificando que la plataforma reciba la confirmación de la orden y muestre una página de éxito en español.

**Acceptance Scenarios**:

1. **Given** un carrito con productos listos para comprar, **When** el cliente hace clic en el botón de pagar, **Then** es redirigido a la pantalla de pago seguro externa.
2. **Given** una transacción exitosa en la pantalla de pago, **When** el cliente es redirigido de vuelta al sitio, **Then** ve una página de confirmación de compra en español con el número de orden.
3. **Given** una transacción cancelada o fallida, **When** el cliente regresa al sitio, **Then** ve un mensaje informando del fallo y el carrito conserva sus productos originales.

---

### Caso de Uso 3 - Administración de Catálogo de Productos (Prioridad: P2)

El administrador de la tienda accede a un panel privado protegido y realiza operaciones de creación, lectura, actualización y eliminación (CRUD) de productos, incluyendo la carga de imágenes.

**Why this priority**: Permite a los administradores gestionar la oferta de productos en la tienda de manera dinámica sin alterar directamente la base de datos.

**Independent Test**: Se valida ingresando al panel de administración autenticado, creando un nuevo producto con imagen, editando sus propiedades, y posteriormente eliminándolo, asegurando que los cambios se reflejen inmediatamente en la base de datos y en la vista del cliente.

**Acceptance Scenarios**:

1. **Given** un administrador autenticado en el panel `/admin`, **When** completa el formulario de creación de producto con título, descripción, precio, stock e imagen y lo envía, **Then** el nuevo producto se añade al listado del panel y aparece en el catálogo del cliente.
2. **Given** un producto existente, **When** el administrador edita su precio en el panel, **Then** el cambio se guarda y el cliente ve el nuevo precio en el catálogo.
3. **Given** un producto obsoleto, **When** el administrador lo elimina desde el panel, **Then** el producto deja de mostrarse en el catálogo del cliente y en el listado del panel.

---

### Edge Cases

- **Pérdida de Conexión en Pasarela**: ¿Qué ocurre si la conexión de red falla inmediatamente después de que el cliente autoriza el pago en la pasarela externa pero antes de regresar a la plataforma? El backend debe procesar de forma segura la confirmación del pago mediante webhooks asíncronos para actualizar el estado de la orden, independientemente del estado del navegador del cliente.
- **Stock Agotado Durante Checkout**: ¿Qué pasa si otro usuario compra la última unidad de un producto mientras un cliente está en la pantalla de pago? La plataforma debe validar el stock real en el servidor antes de autorizar el cargo y, si se ha agotado, rechazar la transacción e informar al usuario en español.
- **Acceso No Autorizado a Rutas Protegidas**: Si un usuario sin rol de administrador intenta acceder manualmente a la ruta `/admin`, el sistema debe interceptarlo en el borde (middleware) y redirigirlo inmediatamente a la página de inicio o login.
- **Reintentos de Red y Cargos Duplicados en Stripe**: Para evitar dobles cargos si un usuario hace doble clic al pagar o hay una desconexión momentánea, toda solicitud de cobro en la API de Stripe debe utilizar una clave de idempotencia única.
- **Tormentas de Reintentos de Webhook (Webhook Retry Storms)**: Para evitar sobrecargar la base de datos cuando Stripe reintente notificaciones fallidas, la ruta `/api/webhooks/stripe` debe procesar la solicitud rápidamente, y las mutaciones en la base de datos deben ser idempotentes (verificando si el pedido ya está en estado 'PAID' antes de actualizar).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: La interfaz de usuario, títulos de página, descripciones, mensajes de error, notificaciones y correos de confirmación deben estar redactados en español.
- **FR-002**: El sistema debe clasificar los usuarios en dos roles distintos: Cliente (acceso de lectura al catálogo y gestión de carrito local) y Administrador (acceso total a la gestión de productos).
- **FR-003**: El panel de administración `/admin` debe ser inaccesible para usuarios sin rol de Administrador.
- **FR-004**: Los administradores deben poder crear, leer, actualizar y eliminar productos, adjuntando al menos una imagen por producto.
- **FR-005**: El catálogo de productos debe mostrar el listado de productos disponibles con sus imágenes, nombres, descripciones y precios.
- **FR-006**: El cliente debe poder gestionar un carrito de compras interactivo para añadir productos, removerlos y editar sus cantidades. El carrito debe persistir localmente entre sesiones.
- **FR-007**: El proceso de compra debe integrar el procesamiento de pagos seguro y notificar la creación exitosa de órdenes mediante webhooks de pago asíncronos.
- **FR-008**: Todas las consultas y mutaciones de datos del cliente deben mostrar vistas de carga (esqueletos de carga) para mejorar la percepción de velocidad.
- **FR-009**: Todas las peticiones de red realizadas en el cliente deben utilizar un mecanismo de cancelación (`AbortController`) con un tiempo de espera de exactamente 10 segundos.
- **FR-010**: Si ocurre un fallo en una API o el servidor experimenta sobrecarga, la aplicación debe capturar el error y desplegar un mensaje en español amigable mediante notificaciones Toast ("Estamos procesando un alto volumen de solicitudes. Por favor, inténtalo de nuevo en unos segundos.") u otros elementos en línea sin bloquear la interfaz.
- **FR-011**: El catálogo de productos debe servirse directamente desde el Edge Cache de Vercel utilizando Incremental Static Regeneration (ISR) o caché agresiva (`fetch` con `revalidate`) para evitar consultas recurrentes a la base de datos.
- **FR-012**: Las mutaciones de base de datos de la aplicación deben utilizar un pool de conexiones (Supabase Supavisor) para prevenir la saturación de conexiones bajo picos de carga.

### Key Entities *(include if feature involves data)*

- **Usuario**: Representa a la persona en el sistema. Almacena su identificador único, correo electrónico y rol asociado (Cliente o Administrador).
- **Producto**: Representa un artículo a la venta. Almacena su nombre, descripción, precio, url de imagen, cantidad de stock disponible e indicador de publicación.
- **Orden**: Registra una compra completada. Contiene un identificador único, referencia al cliente, estado del pago, total cobrado y el detalle de los productos adquiridos.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: La plataforma debe lograr una puntuación de rendimiento de Google Lighthouse mayor a 90 en entornos de escritorio y móviles.
- **SC-002**: El tiempo percibido de carga de la página inicial y el catálogo debe ser inferior a 1.5 segundos en condiciones normales de red.
- **SC-003**: Los cambios de diseño inesperados (Cumulative Layout Shift) en la página del catálogo y de checkout deben ser iguales a 0 (cero).
- **SC-004**: El 100% de los intentos de acceso no autorizados al panel `/admin` por parte de clientes o usuarios anónimos deben ser bloqueados y redirigidos en menos de 200 ms en el borde.
- **SC-005**: El 100% de los elementos visuales del sitio deben tener un contraste de color que cumpla con las pautas de accesibilidad web en español.
- **SC-006**: Las llamadas de creación a la API de Stripe deben registrar un 100% de uso de claves de idempotencia (`idempotency_key`) para evitar transacciones repetidas.
- **SC-007**: Rutas críticas de la API (como `/api/checkout` y endpoints de callback de autenticación `/api/auth/callback`) deben contar con lógica de rate limiting que mitigue ataques DDoS de hasta 10,000 usuarios concurrentes sin degradar el tiempo de respuesta promedio más allá de 500 ms.

## Assumptions

- **A-001**: Se asume que los administradores serán pre-configurados o creados directamente con el rol correspondiente en la base de datos o mediante la consola de Supabase.
- **A-002**: El almacenamiento de imágenes de productos se realizará utilizando un bucket de Supabase Storage.
- **A-003**: La persistencia del carrito se gestionará únicamente del lado del cliente a través de Zustand y localStorage; no se requiere almacenar carritos abandonados en la base de datos para la versión MVP.
- **A-004**: La plataforma asume una moneda única (EUR o USD) configurada en la pasarela de pago.
- **A-005**: Las animaciones fluidas se construirán utilizando la biblioteca GSAP vinculadas al scroll del usuario y al estado de los componentes.
