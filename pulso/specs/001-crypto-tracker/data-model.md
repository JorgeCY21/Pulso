# Modelo de datos

- Coin: `id` único, `symbol`, `name`, `image`, `current_price`, `price_change_percentage_24h`, `total_volume`, `market_cap`, `market_cap_rank`, `high_24h`, `low_24h`, `last_updated`, `sparkline_in_7d.price`.
- History: arrays `prices` y `total_volumes`, cada muestra `[timestamp_ms, number]`. Rechazar muestras no finitas o negativas; ordenar por fecha.
- Favorites: array de IDs en localStorage `pulso:favorites:v1`; sin datos personales.
- CacheEntry: `data`, `storedAt`. Caché memoria/local de respuestas verificadas, nunca etiquetada como una lectura nueva si expiró.
- UI: activo seleccionado, rango {1,7,30,90}, métrica {prices,total_volumes}, búsqueda, pestaña, orden; secuencia creciente de solicitudes para descartar resultados obsoletos.
- Snapshot: `capturedAt`, URL origen, fecha del proveedor, mercados e históricos reales disponibles. Se muestra «Captura» con fecha, no «En vivo».
