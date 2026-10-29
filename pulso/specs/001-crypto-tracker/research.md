# Investigación y decisiones

Consultas: 29/10/2026.

| Tema | Decisión y justificación | Fuente primaria |
|---|---|---|
| SDD | Constituir → especificar → planear → tareas → implementar → verificar/converger. Los comandos del agente son instrucciones, no ejecutables del shell. | https://github.com/github/spec-kit |
| Instalación | Usar distribución oficial `specify-cli` y plantillas oficiales. Registrar versión y salida real. | https://github.github.io/spec-kit/installation.html |
| Mercado | `/coins/markets`, USD, sparkline de 7 d y cambio de 24 h. | https://docs.coingecko.com/demo/reference/coins-markets |
| Búsqueda | `/search?query=...`; tomar IDs, no inferirlos del símbolo. | https://docs.coingecko.com/demo/reference/search |
| Histórico | `/coins/{id}/market_chart?vs_currency=usd&days=...`, respetar timestamps y granularidad automática. | https://docs.coingecko.com/demo/reference/coins-id-market-chart |
| Acciones | Las acciones tokenizadas son un producto distinto; el alcance usa endpoints de monedas y no cotizaciones bursátiles. | https://www.coingecko.com/en/api |
| Rate limits | Caché 60 s mercado, 5 min histórico, debounce y actualización manual. Mostrar 429 sin bucles de reintento. | https://docs.coingecko.com/docs/common-errors-rate-limit |
| Framework | JavaScript nativo permite entrega reproducible sin instalación de paquetes para ejecutar la página. | Decisión del proyecto |

Alternativas descartadas: proveedor de bolsa adicional (fuera del encargo de CoinGecko), series simuladas (falsearían el histórico), clave en el navegador (expondría la credencial), autenticación/base de datos (no necesarias para favoritos locales).
