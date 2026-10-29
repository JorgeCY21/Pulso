# Pulso Constitution

## Core Principles

### I. Especificación como fuente de intención
Toda funcionalidad DEBE corresponder a un requisito y criterio de aceptación documentado.
Los cambios de alcance DEBEN actualizar especificación y tareas antes de implementar.

### II. Integridad del dato financiero
Los precios e históricos DEBEN provenir de CoinGecko. Una captura DEBE incluir su fecha
y distinguirse de una consulta nueva. Está prohibido inventar precios o equiparar
acciones tokenizadas con cotizaciones bursátiles. Los valores ausentes DEBEN verse como «—».

### III. Verificación reproducible
Los cálculos, selección de rangos, caché y fallos de API DEBEN tener pruebas automatizadas.
Los informes DEBEN distinguir mocks, consultas reales y revisiones manuales; los resultados
no ejecutados no pueden registrarse como aprobados.

### IV. Usabilidad y accesibilidad
La página DEBE permitir búsqueda y seguimiento por teclado, mostrar foco visible,
adaptarse a móvil y comunicar estados de carga, vacío y error. El color no DEBE ser
la única señal de variación: se incluyen signos numéricos.

### V. Simplicidad y seguridad
No se incluirán claves privadas en el cliente. Se DEBE usar la menor arquitectura
que resuelva el alcance. Los favoritos DEBEN permanecer en el navegador del usuario.

## Restricciones de producto
Consulta informativa en USD, sin transacciones ni recomendación financiera.
CoinGecko es un tercero cuya disponibilidad y límites no controla este proyecto.

## Flujo de desarrollo y puertas de calidad
Especificar, investigar, planear, descomponer tareas, implementar y verificar.
Antes de la entrega DEBEN pasar las pruebas de lógica y sintaxis. La revisión de navegador
DEBE registrarse con sus límites; una publicación solo se declara correcta tras confirmación.

## Governance
Esta constitución prevalece sobre decisiones técnicas. Las enmiendas documentarán
motivo e impacto. Se usa versionado semántico: major para cambios incompatibles,
minor para nuevos principios y patch para aclaraciones. Cada revisión DEBE comprobar
trazabilidad, integridad de datos y resultados de pruebas.

**Version**: 1.0.0 | **Ratified**: 2026-10-29 | **Last Amended**: 2026-10-29
