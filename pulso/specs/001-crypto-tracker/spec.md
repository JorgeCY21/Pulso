# Especificación funcional: Pulso

Fecha: 29 de octubre de 2026. Estado: especificado antes de la implementación.
Solicitud: caso práctico grupal de SDD con GitHub Spec Kit; rastreador mediante CoinGecko.

## Aclaraciones y alcance

La expresión «criptomonedas / acciones» se interpreta como alternativas de proyecto. Se implementa el rastreador de criptomonedas con la API elegida. No se presentan tokens de acciones como cotizaciones de NASDAQ. AAPL, MSFT y otros símbolos bursátiles comunes reciben una explicación. El alcance se identifica en pantalla e informe.
Los datos se expresan en USD. El volumen de CoinGecko es volumen móvil de 24 horas; no se suma como si cada muestra representara operaciones independientes.
Temporalidades: 24 h, 7 d, 30 d y 90 d. La variación del período del gráfico se diferencia de la variación de mercado de 24 h.

## Historias de usuario y aceptación

### US1 (P1): consultar mercado
Como estudiante quiero buscar BTC o Bitcoin para consultar precio USD, variación de 24 h y volumen de 24 h.
- FR-01: mostrar mercado ordenado por capitalización y datos por activo; los valores ausentes se representan con «—».
- FR-02: filtrar por nombre o símbolo sin distinguir mayúsculas; buscar adicionalmente en el catálogo CoinGecko cuando no hay resultados locales.
- FR-03: seleccionar un resultado y mostrar su información; el identificador de CoinGecko elimina ambigüedades entre símbolos iguales.
- FR-04: informar carga, ausencia de resultados, símbolos bursátiles no soportados y fallos de API sin datos inventados.

### US2 (P1): analizar histórico
Como usuario quiero alternar 24 h, 7 d, 30 d y 90 d para examinar la evolución de un activo.
- FR-05: consultar `/coins/{id}/market_chart` con días 1, 7, 30 y 90 respectivamente.
- FR-06: mostrar gráfico de precio o volumen móvil de 24 h; tooltip con fecha y valor; mínimo, máximo y rendimiento del período calculados sobre muestras válidas.
- FR-07: una respuesta tardía nunca reemplaza la selección más reciente.
- FR-08: no dibujar series ficticias cuando falta el histórico.

### US3 (P2): seguimiento personal
- FR-09: guardar y quitar favoritos en localStorage; recuperarlos al recargar, con funcionamiento degradado si el almacenamiento está bloqueado.
- FR-10: ver solo favoritos y ordenar por precio, variación o capitalización.
- FR-11: actualizar manualmente, reutilizar caché y comunicar cuándo el proveedor no permite nuevas peticiones.

### US4 (P2): entrega académica
- FR-12: entregar constitución, especificación, investigación, plan, modelo, contrato, tareas, checklist e informe con trazabilidad y evidencia real.
- FR-13: interfaz adaptable a móvil, navegación con teclado, contraste y estados accesibles.

## Condiciones de éxito

SC-01: BTC y ETH permiten completar búsqueda → selección → precio y volumen.
SC-02: los cuatro rangos consultan días diferentes y actualizan fechas y métricas.
SC-03: favoritos persisten tras recargar.
SC-04: 429 o red caída producen un aviso y, si existe, una captura real identificada con fecha; jamás la etiqueta «en vivo».
SC-05: pruebas automatizadas y comprobación visual documentadas, con limitaciones explícitas.

## No objetivos

Compra/venta, autenticación propia, consejos de inversión, alertas, portafolios con saldos, acciones de bolsa, velas OHLC inventadas o datos en streaming.
