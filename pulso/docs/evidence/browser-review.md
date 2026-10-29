# Revisión de navegador

Fecha: 2026-10-29. Navegador integrado de Codex. Se usaron la página local y datos reales; no se interceptó la red para sustituir cotizaciones.

| Escenario | Resultado observado |
|---|---|
| Inicio | 50 activos, Bitcoin seleccionado, precio USD y métricas. Etiqueta de consulta a CoinGecko con hora |
| BTC | Coincidencia local Bitcoin, con precio y cambio 24 h |
| ETH | Coincidencias por subcadena; selección explícita Ethereum actualizó título y datos |
| AAPL | Explicación de acción bursátil fuera del alcance |
| Temporalidades | 24 h: 288 muestras; 7 d: 169; 30 d: 721; 90 d: 2160 en captura. 90 d también se observó como consulta actual |
| Cambios rápidos | Alternar 1 → 30 → 90 no dejó el rango anterior en pantalla; revisión de secuencia en código |
| Volumen | Leyenda «Volumen móvil 24 h · USD» |
| Tooltip por teclado | Flecha izquierda mostró 29/10/26 10:00, USD 81,144.77 en una muestra de Bitcoin |
| Favoritos | Contador 1, Bitcoin en favoritos, recarga conservó 1; se retiró al terminar la prueba |
| Fallo real del proveedor | Se mostró captura con fecha y número de muestras al agotarse el acceso temporal al histórico |
| Móvil | Override 390 × 844; área útil 375 px por scrollbar. Antes del arreglo: scrollWidth 492. Después: clientWidth=375, scrollWidth=375 |
| Escritorio | 1086 px de área útil, gráfico y panel lateral alineados; evidencia desktop.png |
| Informe | Navegación mediante enlace lateral, título y documento legibles |

El error móvil se corrigió estableciendo la tabla como contenedor posicionado para las etiquetas ocultas y limitando el ancho de nombres largos. Se restableció el tamaño de navegador al finalizar.

Archivos visuales: `desktop.png` y `mobile.png`. Las capturas muestran un estado temporal de datos, no precios permanentes.

Límites: revisión de accesibilidad básica; no auditoría WCAG completa. No se probaron todas las combinaciones de navegador/sistema ni se simuló cada posible orden de respuestas de red.
