# E-Commerce UCAB - Actividad Extra

**Estudiante:** Sebastián Pérez  
**Materia:** Programación Orientada a la Web  

## Estructura de Archivos del Sistema (Client-Side)
El proyecto ha sido estructurado siguiendo principios de separación de responsabilidades en Vanilla JS:
- `index.html`: Layout global SPA con Tailwind CSS v4 integrado.
- `data-base.js`: Inicializador de la base de datos simulada y sincronización con FakeStoreAPI.
- `authenticator.js`: Capa encargada del control de accesos, roles y perfiles en el cliente.
- `application.js`: Motor interactivo central, enrutamiento, lógica del carrito y dashboard de métricas.
- `service-worker.js`: Script de Service Worker encargado del almacenamiento en caché estática y soporte offline.

## Uso de Inteligencia Artificial Generativa
De acuerdo con las pautas de la actividad, se hace constar que se utilizó asistencia de IA generativa para el desarrollo del proyecto bajo los siguientes alcances:

- **Estructura y Persistencia:** Apoyo en el diseño de la estrategia híbrida en `data-base.js` para consumir inicialmente FakeStoreAPI y migrar el flujo transaccional al `localStorage`.
- **Lógica de Estado Offline:** Diseño del ciclo de vida del Service Worker (`service-worker.js`) para el almacenamiento en caché de los archivos del lado del cliente y el control asíncrono de la cola de compras offline.
- **Cálculo de Métricas:** Asistencia en el uso de métodos avanzados de arreglos (`reduce`, `sort`, `slice`) para computar de forma dinámica el Top 3 de productos más vendidos en la vista de administración.