# Plan técnico

## Puerta constitucional
Datos verificables, SDD previo al código, accesibilidad, mínima arquitectura y seguridad: aprobado en el diseño.

## Arquitectura
Sitio estático HTML, CSS y JavaScript ES Modules, sin dependencias de producción. CoinGecko público desde navegador. Servidor Node nativo solo para desarrollo. No hay secretos incluidos ni claves API persistidas. El acceso público sin clave se comprueba durante la ejecución, pero el proveedor puede exigir clave o limitar peticiones. La UI informa el error y usa únicamente caché real identificada. Para acceso autenticado futuro se necesita un proxy con secreto del servidor.

`dist/index.html` → `dist/app.js` (estado y eventos) → `dist/core.js` (API, caché, validación, cálculos).
`dist/styles.css`: diseño responsive. `dist/snapshot.json`: captura opcional verificable.

## Diseño revisado antes de implementar
Marca Pulso. Fondo #F5F7FA, papel #FFFFFF, tinta #182B35, verde petróleo #087F72, positivo #168563, negativo #C34C63. Tipografía Manrope para interfaz y números tabulares. Alineación izquierda, navegación lateral discreta, gráfico amplio y tabla de mercado inferior; panel lateral de contexto del activo. Se descarta el hero promocional: el gráfico y la búsqueda son el trabajo principal. Los datos tienen prioridad sobre decoración. En móvil desaparece la barra lateral y las columnas secundarias se ocultan.

## Secuencia
1. Inicializar GitHub Spec Kit y conservar su procedencia.
2. Aprobar constitución, especificación, investigación, contratos y tareas.
3. Implementar funciones puras/API y estados de datos.
4. Implementar mercado, gráfico, búsqueda y favoritos.
5. Ejecutar pruebas de lógica y escenarios de navegador; revisar escritorio/móvil.
6. Completar informe, evidencias y publicación privada.

## Estrategia de verificación
Node test runner para rangos, cálculos, normalización, caché, timeout y fallos de API. Navegador para navegación, temporalidades, favoritos, búsquedas y accesibilidad básica. Comprobación de sintaxis. Pruebas con mocks se distinguen de consultas reales. Sin promesas de disponibilidad de terceros.
